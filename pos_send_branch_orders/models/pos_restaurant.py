from odoo import api, fields, models, _
from odoo.exceptions import UserError


class RestaurantFloor(models.Model):

    _inherit = 'restaurant.floor'

    is_call_center = fields.Boolean("Call Center")


class RestaurantTable(models.Model):

    _inherit = 'restaurant.table'

    is_call_center = fields.Boolean("Call Center", compute="_compute_call_center_table", store=True)

    @api.model
    @api.depends('floor_id.is_call_center')
    def _compute_call_center_table(self):
        for rec in self:
            if rec.floor_id.is_call_center:
                rec.is_call_center = True
            else:
                rec.is_call_center = False

    def _config_selection(self):
        config = self.env['pos.config'].sudo().search([])
        if config:
            return list(map(lambda c: (str(c.id), c.name), config))

    destination_config_id = fields.Selection(
        selection=lambda self: self._config_selection(),
        string="POS",
        help="Destination POS"
    )

    def _table_selection(self):
        domain = [('id', '=', self.destination_config_id)]
        tables = self.env['pos.config'].sudo().search(domain).mapped('floor_ids').mapped('table_ids').ids
        return tables

    @api.onchange('destination_config_id')
    def onchange_destination_config_id(self):
        for rec in self:
            if rec.destination_config_id:
                table_ids = rec._table_selection()
                domain = [('id', 'in', table_ids)]
                return {'domain' : {
                    'destination_table': domain,
                }}

    destination_table = fields.Many2one("restaurant.table",
                                        string="Floor / Table",
                                        help="Destination Floor / Table")
    @api.model
    def create_from_ui(self, table):
        if table.get('destination_table'):
            del table['destination_table']
        return super(RestaurantTable, self).create_from_ui(table)

    def name_get(self):
        if self._context.get('show_floor_table'):
            res = []
            for table in self:
                name = table.name
                if table.floor_id:
                    name = '%s -> %s' % (table.floor_id.name, name)
                res.append((table.id, name))
            return res
        return super(RestaurantTable, self).name_get()