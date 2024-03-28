# -*- coding: utf-8 -*-
import logging
from odoo import models, fields, api
from odoo.tools import DEFAULT_SERVER_DATETIME_FORMAT

import psycopg2
import pytz
from pytz import timezone
from datetime import datetime, date, timedelta

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = "pos.order"

    initiate_sync = fields.Boolean("Initiate Sync")
    source_session_id = fields.Integer('Source Session ID')

    @api.model
    def _order_fields(self, ui_order):
        order = super(PosOrder, self)._order_fields(ui_order)
        # print("printing------ _order_fields")
        order['initiate_sync'] = ui_order.get('initiate_sync', False)
        order['source_session_id'] = ui_order.get('source_session_id', False)

        return order

    def _get_fields_for_draft_order(self):
        fields = super(PosOrder, self)._get_fields_for_draft_order()
        fields.append('initiate_sync')
        fields.append('source_session_id')

        return fields


    @api.model
    def _process_branch_order(self, order, draft, existing_order):
        """Create or update an pos.order from a given dictionary.

        :param pos_order: dictionary representing the order.
        :type pos_order: dict.
        :param draft: Indicate that the pos_order is not validated yet.
        :type draft: bool.
        :param existing_order: order to be updated or False.
        :type existing_order: pos.order.
        :returns number pos_order id
        """
        order = order['data']
        table_id = self.env['restaurant.table'].browse(order['table_id'])

        d_table_id = table_id.destination_table
        d_config = table_id.destination_config_id
        d_config_id = self.env['pos.config'].sudo().search([
                ('id', '=', d_config),
            ])
        d_company_id = d_config_id.company_id

        # d_session_id = d_config_id.current_session_id

        domain = [
            ('state', '=', 'opened'),
            ('rescue', '=', False),
            ('config_id', '=', d_config_id.id),
        ]
        d_pos_session_id = self.env['pos.session'].sudo().search(domain, limit=1)
        # pos_session = self.env['pos.session'].sudo().search(domain, limit=1)
        # if d_pos_session_id.state == 'closing_control' or d_pos_session_id.state == 'closed':
            # order['pos_session_id'] = self._get_valid_session(order).id

        order['table_id'] = d_table_id.id
        order['config_id'] = d_config_id.id
        order['pos_session_id'] = d_pos_session_id.id
        order['company_id'] = d_company_id.id

        pos_order = False
        if not existing_order:
            pos_order = self.sudo().create(self.sudo()._order_fields(order))
        else:
            pos_order = existing_order
            pos_order.lines.unlink()
            order['user_id'] = pos_order.user_id.id
            pos_order.sudo().write(self.sudo()._order_fields(order))

        # print("created id", pos_order.id)
        return pos_order.id

    @api.model
    def create_from_ui(self, orders, draft=False):
        order_ids = []
        for order in orders:
            if 'table_id' in order['data']:
                table_id = self.env['restaurant.table'].sudo().search([('id', '=', order['data']['table_id'])])
                if table_id and table_id.is_call_center and order['data']['initiate_sync']:
                    if 'server_id' in order['data']:
                        existing_order = self.env['pos.order'].search(['|', ('id', '=', order['data']['server_id']),
                                                                       ('pos_reference', '=', order['data']['name'])],
                                                                      limit=1)
                    if (existing_order and existing_order.state == 'draft') or not existing_order:
                        order_ids.append(self._process_branch_order(order, draft, existing_order))

                    # print("agaya medan me")
                    # print(order_ids)
                    # print(self.env['pos.order'].sudo().search_read(domain=[('id', 'in', order_ids)],
                    #                                      fields=['id', 'pos_reference']))
                    return self.env['pos.order'].sudo().search_read(domain=[('id', 'in', order_ids)],
                                                         fields=['id', 'pos_reference'])

                else:
                    return super(PosOrder, self).create_from_ui(orders, draft=draft)

    @api.model
    def fetch_cc_orders(self, session_id, columns):
        result = {
            'count': 0,
            'orders': []
        }
        orders_stack = []
        if session_id:
            orders = self.sudo().search([('source_session_id', '=', session_id)])
            result['count'] = len(orders)
            sno = 1
            if orders:
                for order in orders:

                    if order.pos_reference_number == '/':
                        status_string = "Awaiting Branch Response"
                    elif not order.date_kot:
                        status_string = "Branch Seen"
                    elif order.date_kot and not order.rider_id:
                        status_string = "Preparing"
                    elif order.rider_id and order.state in ['draft']:
                        status_string = "On Delivery"
                    elif order.state in ['paid', 'done', 'invoiced']:
                        status_string = "Completed"
                    else:
                        status_string = "Unknown"

                    order_vals = {
                        'S.No': sno,
                        'Date': self.get_datetime_tz(order.date_order),
                        'Kot Date': self.get_datetime_tz(order.date_kot) or '',
                        'Branch': order.config_id.name,
                        'Branch Order#': order.pos_reference_number,
                        'Name': order.partner_id.name,
                        'Reference': order.pos_reference,
                        'Rider': order.rider_id.name if order.rider_id else '-',
                        'Status': status_string
                    }
                    items = list(order_vals.items())

                    if 'phone' in columns:
                        pos = list(order_vals.keys()).index('Reference')
                        items.insert(pos, ('Phone', order.partner_id.phone or '-'))
                        order_vals = dict(items)

                    if 'address' in columns:
                        pos = list(order_vals.keys()).index('Reference')
                        items.insert(pos, ('Address', order.partner_id.street or '-'))
                        order_vals = dict(items)


                    orders_stack.append(order_vals)
                    sno = sno+1

            result['orders'] = orders_stack
        return result


    def get_datetime_tz(self, date_time):
        if date_time:
            if self._context and self._context.get('tz'):
                tz = self._context['tz']
                tz = timezone(tz)
            else:
                tz = pytz.utc
            if tz:
                c_time = datetime.now(tz)
                hour_tz = int(str(c_time)[-5:][:2])
                min_tz = int(str(c_time)[-5:][3:])
                sign = str(c_time)[-6][:1]
                if sign == '+':
                    date_time = datetime.strptime(str(date_time), DEFAULT_SERVER_DATETIME_FORMAT) + \
                                timedelta(hours=hour_tz, minutes=min_tz)
                else:
                    date_time = datetime.strptime(str(date_time), DEFAULT_SERVER_DATETIME_FORMAT) - \
                                timedelta(hours=hour_tz, minutes=min_tz)
            else:
                date_time = datetime.strptime(str(date_time), DEFAULT_SERVER_DATETIME_FORMAT)
            return date_time.strftime(DEFAULT_SERVER_DATETIME_FORMAT)