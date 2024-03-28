# -*- coding: utf-8 -*-
import logging
from odoo import models, fields, api
import psycopg2
_logger = logging.getLogger(__name__)


class PosSession(models.Model):
    _inherit = 'pos.session'

    @api.model
    def action_get_branch_sync_orders(self, config_id):
        session = self.env['pos.session'].sudo().search([('config_id','=',config_id), ('rescue','=',False), ('state','=','opened')], limit=1)
        print("session",session)
        print("config_id",config_id)
        orders = []
        for order in session.order_ids:
            if order.initiate_sync and order.state == 'draft':
                orders.append(order.id)

        print(orders)
        return orders

# @api.model
    # def get_active_sessions(self, config_id):
    #     active_sessions = self.env['pos.session'].sudo().search([('state','=','opened'), ('config_id','!=', config_id)])
    #     destination = []
    #     for session in active_sessions:
    #         result = {
    #             'session_id': False,
    #             'company_id': False,
    #             'config_id': False,
    #             'floor_id': False,
    #             'table_id': False
    #         }
    #         floors = session.config_id.mapped('floor_ids').filtered(lambda s: s.is_delivery)
    #         found = False
    #         for floor in floors:
    #             for table in floor.table_ids:
    #                 if not found:
    #                     found = True
    #                     result['session_id'] = session.id
    #                     result['session_name'] = session.name
    #                     result['company_id'] = session.company_id.id
    #                     result['company_name'] = session.company_id.name
    #                     result['config_id'] = session.config_id.id
    #                     result['config_name'] = session.config_id.name
    #                     result['floor_id'] = floor.id
    #                     result['table_id'] = table.id
    #                     result['table_name'] = table.name
    #                     destination.append(result)
    #
    #     # print(destination)
    #     return destination

    def _loader_params_restaurant_table(self):
        """For add fields ('reserved', 'reservation_details')"""
        result = super()._loader_params_restaurant_table()
        result['search_params']['fields'].append('is_call_center')
        return result