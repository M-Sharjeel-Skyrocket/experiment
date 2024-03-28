# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import models


class PosSession(models.Model):
    _inherit = 'pos.session'

    def _loader_params_product_product(self):
        result = super()._loader_params_product_product()
        result['search_params']['fields'].append('product_pack_id')
        result['search_params']['fields'].append('product_fix_pro_ids')
        result['search_params']['fields'].append('is_pack')
        result['search_params']['fields'].append('is_extra')
        result['search_params']['fields'].append('product_extra_id')
        return result

    # Load 'Product Pack' Models Here for session
    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        new_model = 'product.pack'
        if new_model not in result:
            result.append(new_model)
        return result

    def _loader_params_product_pack(self):
        return {'search_params': {'domain': [],
                                  'fields': ['id', 'product_categ_id', 'product_quantity', 'product_selection', 'hnh', 'required_item'],
                                  'load': False}}

    def _get_pos_ui_product_pack(self, params):
        """
        Fetches and returns the records from the 'product.pack'
        model based on the specified search parameters.

        :param params: The parameters for the search operation.
        :type params: dict
        :return: The fetched records.
        :rtype: list
        """
        pack_product = self.env['product.pack'].search_read(**params['search_params'])
        return pack_product

    def _pos_data_process(self, loaded_data):
        super()._pos_data_process(loaded_data)

    # Load 'fix.product.pack' Models Here for session
    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        new_model = 'fix.product.pack'
        if new_model not in result:
            result.append(new_model)
        return result

    def _loader_params_fix_product_pack(self):
        return {'search_params': {'fields': ['id', 'product_p_id', 'product_quantity']}}

    def _get_pos_ui_fix_product_pack(self, params):
        fix_pack_product = self.env['fix.product.pack'].search_read(**params['search_params'])
        return fix_pack_product

    def _pos_data_process(self, loaded_data):
        super()._pos_data_process(loaded_data)

    # Load 'product.extra.topping' Models Here for session
    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        new_model = 'product.extra.topping'
        if new_model not in result:
            result.append(new_model)
        return result

    def _loader_params_product_extra_topping(self):
        return {
            'search_params': {'fields': ['id', 'product_categ_id', 'multi_selection']}}

    def _get_pos_ui_product_extra_topping(self, params):
        product_extra_topping = self.env['product.extra.topping'].search_read(**params['search_params'])
        return product_extra_topping

    def _pos_data_process(self, loaded_data):
        super()._pos_data_process(loaded_data)