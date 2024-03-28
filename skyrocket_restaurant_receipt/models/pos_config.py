from odoo import api, fields, models, _
from odoo.exceptions import ValidationError, UserError

class PosConfig(models.Model):
    _inherit = 'pos.config'

    @api.model
    def _get_allowed_change_fields(self):
        fields = super(PosConfig, self)._get_allowed_change_fields()
        fields.append('receipt_footer')
        fields.append('receipt_header')
        fields.append('module_account')
        fields.append('iface_print_skip_screen')
        return fields
