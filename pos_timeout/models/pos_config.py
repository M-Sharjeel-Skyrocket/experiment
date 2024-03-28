from odoo import fields, models

class PosConfig(models.Model):
    _inherit = "pos.config"

    pos_order_timeout = fields.Integer(
        string="PoS Order(s) Timeout",
	    default=60,
        help="Defines the value of the"
        " client-side timeout for the creation of PoS Order(s)."
    )

