# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models


class ResPartner(models.Model):
    _inherit = 'res.partner'

    last_order_date = fields.Date("Last Order Date", compute="_last_order_data", store=True)
    last_order_amount = fields.Float("Last Order Amount", compute="_last_order_data", store=True)
    total_orders_amount = fields.Float("Total Order Amount", compute="_total_order_data", store=True)
    total_orders_count = fields.Integer("Total Order Count", compute="_total_order_data", store=True)

    @api.depends("pos_order_ids")
    def _total_order_data(self):
        for rec in self:
            rec.total_orders_amount = False
            rec.total_orders_count = False

            total_orders = self.env['pos.order'].search([('id', 'in', rec.pos_order_ids.ids)])
            if total_orders:
                rec.total_orders_amount = sum(total_orders.mapped("amount_total"))
                rec.total_orders_count = len(total_orders)

    @api.depends("pos_order_ids")
    def _last_order_data(self):
        for rec in self:
            rec.last_order_date = False
            rec.last_order_amount = False

            last_order = self.env['pos.order'].search([('id', 'in', rec.pos_order_ids.ids)], order='id desc', limit=1)
            if last_order:
                rec.last_order_date = last_order.date_order
                rec.last_order_amount = last_order.amount_total


