import json

from odoo import api, models, api, fields

class PartnerAddresses(models.Model):
    _name = "res.partner.addresses"

    address = fields.Char("Address")
    partner_id = fields.Many2one("res.partner", string='Partner',
        index=True, required=True, readonly=True, auto_join=True, ondelete="cascade",
        help="Contact Addreses.")

class POSResUsers(models.Model):

    _inherit = 'res.partner'

    branch_company_id = fields.Many2one('res.company', 'Branch Company')
    partner_addresses_ids = fields.One2many('res.partner.addresses', 'partner_id', string='Addreses')
    partner_addresses_array = fields.Text("Partner Addresses", compute="_get_partner_addresses")

    @api.depends("partner_addresses_ids")
    def _get_partner_addresses(self):
        for rec in self:
            if rec.partner_addresses_ids:
                addresses = rec.partner_addresses_ids.mapped("address")
                rec.partner_addresses_array = json.dumps(addresses)
            else:
                rec.partner_addresses_array = False

    @api.model
    def create_update_select(self, id, name, address, new_address, phone, secondary_phone, company):
        if id:
            get_from_userId = self.env['res.partner'].search([('id', '=', id)])
        else:
            get_from_userId = self.env['res.partner'].search([('phone', '=', phone)], limit=1)

        if get_from_userId:

            update_user_vals = {
                'name': name,
                'phone': phone,
                'mobile': secondary_phone,
                'street': address,
                'customer_rank': 1,
            }

            if new_address:
                update_user_vals.update({
                    'street': new_address,
                    'partner_addresses_ids': [(0, 0, {
                        'address': new_address,
                    })]
                })

            # Update User
            get_from_userId.sudo().update(update_user_vals)

            return get_from_userId.id

        else:
            # Create User
            new_user_vals = {
                'name': name,
                'phone': phone,
                'mobile': secondary_phone,
                'street': address,
                'branch_company_id': company,
                'customer_rank': 1,
            }

            if new_address:
                new_user_vals.update({
                    'street': new_address,
                    'partner_addresses_ids': [(0, 0, {
                        'address': new_address,
                    })]
                })

            new_user = self.env['res.partner'].sudo().create(new_user_vals).id
            return new_user
