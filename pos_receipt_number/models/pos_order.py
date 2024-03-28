# -*- coding: utf-8 -*-
from odoo import models, fields, api


class PosOrder(models.Model):
    _inherit = "pos.order"

    pos_sequence_number = fields.Integer(string='Pos Sequence Number', help='A session-unique sequence number for the order', default=0)
    pos_reference_number = fields.Char(string='Receipt Number', readonly=True, copy=False, default='/')

    @api.model
    def _order_fields(self, ui_order):
        order = super(PosOrder, self)._order_fields(ui_order)
        order['pos_sequence_number'] = ui_order.get('pos_sequence_number', 0)
        order['pos_reference_number'] = ui_order.get('pos_reference_number', False)
        return order

    def _get_fields_for_draft_order(self):
        fields = super(PosOrder, self)._get_fields_for_draft_order()
        fields.append('pos_sequence_number')
        fields.append('pos_reference_number')
        return fields
