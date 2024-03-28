from odoo import fields, models, api

class PosConfigSetting(models.TransientModel):
    _inherit = "res.config.settings"

    res_order_timeout = fields.Integer(
        string="PoS Order(s) Timeout", related="pos_config_id.pos_order_timeout", readonly=False,
        help="Defines the value of the"
        " client-side timeout for the creation of PoS Order(s)."
    )

    @api.constrains('res_order_timeout')
    def change_pos_order_timeout(self):
        pos_config = self.env['pos.config'].search([])
        for pos_list in pos_config:
            pos_list.write({'pos_order_timeout': self.res_order_timeout})
            # res_timeout = self.res_order_timeout
