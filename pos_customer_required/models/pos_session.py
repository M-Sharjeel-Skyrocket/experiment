# -*- coding: utf-8 -*-
from odoo import models, fields, api


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_res_partner(self):
        result = super()._loader_params_res_partner()
        result['search_params']['fields'].append('partner_addresses_array')
        return result

    def _pos_data_process(self, loaded_data):
        super()._pos_data_process(loaded_data)
