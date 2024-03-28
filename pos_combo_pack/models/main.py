from odoo import api, fields, models, _


class pos_order_line_combo(models.Model):
    _name = "pos.order.line.combo"
    _description = "Pos Order Line Combo"

    name = fields.Char(string="Name")
    price_subtotal_incl = fields.Float(string="Subtotal")
    price_subtotal = fields.Float(string="Subtotal w/o Tax")
    tax_ids = fields.Many2many('account.tax', 'pos_combo_tax_default_rel', string='Default Taxes')
    qty = fields.Float('Quantity', default='1', required=True)
    product_id = fields.Many2one('product.product', 'Item')
    line_id = fields.Many2one('pos.order.line', 'POS Line')


class pos_order_line(models.Model):
    _inherit = "pos.order.line"

    is_extra = fields.Boolean("Is Extra")
    is_pack = fields.Boolean("Is Combo Pack")
    combo_ids = fields.Text("Combo Lines")
    own_ids = fields.Text("Extra Toppings")


class ProductPack(models.Model):
    _name = "product.pack"
    _description = "Product packs"

    product_categ_id = fields.Char(string='Products', required=True)
    product_quantity = fields.Float('Quantity', default='1', required=True)
    product_selection = fields.Many2many('product.product', string='Select Multiple Related Products', required=True)
    product_template_id = fields.Many2one('product.template', 'Item')
    hnh = fields.Boolean(string="H/H", help="For pizza someimes it requires half and half for customer.")
    required_item = fields.Boolean(string="Required", default=True)


class FixProductPack(models.Model):
    _name = "fix.product.pack"
    _description = "Fix Product Pack"

    product_p_id = fields.Many2one('product.product', 'Product', required=True)
    product_quantity = fields.Float('Quantity', default='1', required=True)
    product_template_id = fields.Many2one('product.template', 'Item')


class pos_order_line_own(models.Model):
    _name = "pos.order.line.own"
    _description = "Pos Order Live Make Own"

    name = fields.Char(string="Name")
    qty = fields.Float('Quantity', default='1', required=True)
    product_id = fields.Many2one('product.product', 'Item')
    orderline_id = fields.Many2one('pos.order.line', 'POS Line')
    price = fields.Float('Price', required=True)


class ProductExtraTopping(models.Model):
    _name = "product.extra.topping"
    _description = "Product Extra Toppings"
    _rec_name = 'product_categ_id'

    product_template_id = fields.Many2one('product.template', 'Item')
    multi_selection = fields.Boolean("Multiple Selection")
    product_categ_id = fields.Many2one('pos.category', 'Category', required=True)


class ProductTemplate(models.Model):
    _inherit = "product.template"

    is_pack = fields.Boolean('Combo Pack', default=False)
    is_extra = fields.Boolean('Make Own', default=False, help="This will use for ")
    product_extra_id = fields.One2many('product.extra.topping', 'product_template_id', 'Product Toppings')
    product_pack_id = fields.One2many('product.pack', 'product_template_id', 'Items in the pack')
    product_fix_pro_ids = fields.One2many('fix.product.pack', 'product_template_id', 'Fix Pack Product')

class PosOrder(models.Model):
    _inherit = 'pos.order'

    def _get_fields_for_order_line(self):
        fields = super(PosOrder, self)._get_fields_for_order_line()
        fields.append('is_pack')
        fields.append('is_extra')
        fields.append('combo_ids')
        fields.append('own_ids')
        return fields

    def _get_fields_for_draft_order(self):
        fields = super(PosOrder, self)._get_fields_for_draft_order()
        fields.append('finalized_order')
        return fields

    @api.model
    def _order_fields(self, ui_order):
        order_fields = super(PosOrder, self)._order_fields(ui_order)
        order_fields['finalized_order'] = ui_order.get('finalized_order', False)
        return order_fields