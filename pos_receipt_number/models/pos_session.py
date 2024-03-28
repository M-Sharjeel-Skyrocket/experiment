# -*- coding: utf-8 -*-
from odoo import models, fields, api


class PosSession(models.Model):
    _inherit = "pos.session"

    current_sequence_number = fields.Integer(help='A session-unique sequence number for the order', default=0, compute='_onchange_order_ids', store=True,readonly=True, copy=False)

    # # TODO Delete this
    # def reset_sequence(self):
    #     self.current_sequence_number = 0 current_sequence_number
    def _loader_params_pos_session(self):
        result = super()._loader_params_pos_session()
        result['search_params']['fields'].append('current_sequence_number')
        return result

    @api.depends('order_ids')
    def _onchange_order_ids(self):
        if self.order_ids:
            next_seq = max(self.order_ids.mapped('pos_sequence_number'))
            if next_seq > 0:
                self.current_sequence_number = next_seq
