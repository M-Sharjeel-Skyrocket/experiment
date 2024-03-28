from collections import Counter

from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError
from odoo.tools.float_utils import float_round, float_compare, float_is_zero

class StockMoveLineInherit(models.Model):
    _inherit = "stock.move.line"

    retail_value = fields.Float(string="Retail", related="product_id.list_price", store=True)
    cost_value = fields.Float(string="Cost", related="product_id.standard_price", store=True)
    retail_value_qty = fields.Float(string="Retail Value", compute="_retail_with_qty", store=True)

    @api.depends("retail_value", "qty_done")
    def _retail_with_qty(self):
        for rec in self:
            if rec.qty_done > 0:
                rec.retail_value_qty = rec.retail_value * rec.qty_done
            else:
                rec.retail_value_qty = 0


    @api.onchange('product_id')
    def update_retail_cost(self):
        for rec in self:
            if rec.product_id:
                rec.retail_value = rec.product_id.list_price
                rec.cost_value = rec.product_id.standard_price

    # @api.model_create_multi
    # def create(self, vals_list):
    #     move_lines = super(StockMoveLineInherit, self).create(vals_list)
    #     for move_line in move_lines:
    #         print("11")
    #         # if move_line.state != 'done':
    #         #     continue
    #         move = move_line.move_id
    #         print("11")
    #         product = self.env['product.product'].browse(move.product_id)
    #         for key in product:
    #             print(key)
    #         print(move.product_id.lst_price)
    #         print(move.product_id.list_price)
    #         print(move.product_id.standard_price)
    #         print(move.product_id.name)
    #         print(move.product_id)
    #         move.write({
    #             'cost_value' : move.product_id.standard_price,
    #             'retail_value': move.product_id.lst_price
    #         })
    #     return move_lines
    #
    # def write(self, vals):
    #     move = super(StockMoveLineInherit, self).write(vals)
    #     # print("asdasds")
    #     # # if move_line.state != 'done':
    #     # #     continue
    #     # move = move_line.move_id
    #     # print("asdasds")
    #     # print(move.product_id.lst_price)
    #     # print(move.product_id.list_price)
    #     # print(move.product_id.standard_price)
    #     # move_line.cost_value = move.product_id.standard_price
    #     # move_line.retail_value = move.product_id.standard_price
    #     print(move)
    #
    #     return move

    # @api.model_create_multi
    # def create(self, vals):
    #     if self.product_id:
    #         # product = self.env['product.product']
    #         res = super(StockMoveLineInherit, self).create(vals)
    #         # self.retail_value =
    #         print(self.product_id)
    #         print("Create hoa")
    #         res.write({
    #             'cost_value' : self.product_id.standard_price,
    #             'retail_value': self.product_id.lst_price
    #         })
    #         return res
