# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    is_call_center = fields.Boolean("Call Center", compute="_check_call_center")

    @api.depends("floor_ids")
    def _check_call_center(self):
        for rec in self:
            rec.is_call_center = False
            if rec.floor_ids:
                if any(rec.floor_ids.mapped('is_call_center')):
                    rec.is_call_center = True

    def get_unprinted_orders(self):
        """         """
        self.ensure_one()
        new_orders = []
        session_orders = self.env['pos.session'].search([('id', '=', self.id)]).order_ids
        open_orders = session_orders.filtered(lambda o: not o.date_kot and o.initiate_sync and o.state == 'draft')
        order_count = len(open_orders)
        for order in open_orders:
            order_arr = {
                'order_id': order.id,
                'partner_id': order.partner_id.id if order.partner_id else False
            }
            new_orders.append(order_arr)

        if order_count:
            return {'message': True, 'count': order_count, 'orders': new_orders}
        else:
            return {'message': False, 'count': 0}
