from odoo import api, models, fields
from functools import partial
import json

class PosOrder(models.Model):
    _inherit = "pos.order"

    finalized_order = fields.Boolean("Finalized")

    @api.model
    def _order_fields(self, ui_order):
        order_fields = super(PosOrder, self)._order_fields(ui_order)
        order_fields['finalized_order'] = ui_order.get('finalized_order', False)

        if order_fields['finalized_order'] or order_fields['to_invoice']:
            process_line = partial(self.env['pos.order.line']._order_line_fields, session_id=ui_order['pos_session_id'])
            order_lines = [process_line(l) for l in ui_order['lines']] if ui_order['lines'] else False
            new_order_line = []
            for order_line in order_lines:
                new_order_line.append(order_line)
                if order_line[2].get('combo_ids'):
                    combo_pro_list = [process_line(l) for l in json.loads(order_line[2]['combo_ids'])] if order_line[2]['combo_ids'] else False
                    if combo_pro_list:
                        for combo in combo_pro_list:
                            new_order_line.append(combo)
                if order_line[2].get('own_ids'):
                    own_pro_list = [process_line(l) for l in order_line[2]['own_ids']] if order_line[2]['own_ids'] else False
                    if own_pro_list:
                        for own in own_pro_list:
                            new_order_line.append(own)
            order_fields['lines'] = new_order_line

        return order_fields
