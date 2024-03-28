###################################################################################
#
#    Copyright (c) 2017-2019 MuK IT GmbH.
#
#    This file is part of MuK Utils
#    (see https://mukit.at).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Lesser General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Lesser General Public License for more details.
#
#    You should have received a copy of the GNU Lesser General Public License
#    along with this program. If not, see <http://www.gnu.org/licenses/>.
#
###################################################################################

from odoo import api, fields, models, _

from server.odoo.exceptions import ValidationError

class Groups(models.AbstractModel):

    _name = "muk_utils.mixins.groups"
    _description = "Group Mixin"

    _parent_store = True
    _parent_name = "parent_group"

    # ----------------------------------------------------------
    # Database
    # ----------------------------------------------------------

    name = fields.Char(string="Group Name", required=True, translate=True)

    parent_path = fields.Char(string="Parent Path", index=True)

    count_users = fields.Integer(compute="_compute_users", string="Users", store=True)
    parent_group = fields.Many2one('muk_utils.mixins.groups', string='Parent', index=True)
    parent_path = fields.Char(index=True, unaccent=False)
    child_ids = fields.One2many('muk_utils.mixins.groups', 'parent_group', 'Child Categories')
    complete_name = fields.Char('Complete Name', compute='_compute_complete_name', recursive=True, store=True)
    groups = fields.Many2many('res.groups', string="Groups", compute='_compute_complete_name', automatic=True, recursive=True, store=True)
    explicit_users = fields.Many2many('res.users', 'explicit_users_rel', automatic=True)
    users = fields.Many2many('res.users', string="Group Users", compute="_compute_users", store=True, automatic=True)
    child_groups = fields.One2many("muk_utils.mixins.groups", inverse_name="parent_group", string="Child Groups", automatic=True,)

    @api.model
    def name_create(self, name):
        return self.create({'name': name}).name_get()[0]

    def name_get(self):
        if not self.env.context.get('hierarchical_naming', True):
            return [(record.id, record.name) for record in self]
        return super().name_get()

    @api.depends('name', 'parent_group.complete_name')
    def _compute_complete_name(self):
        for category in self:
            if category.parent_group:
                category.complete_name = '%s / %s' % (category.parent_group.complete_name, category.name)
            else:
                category.complete_name = category.name

    @api.constrains('parent_group')
    def _check_parent_group(self):
        if not self._check_recursion():
            raise ValidationError(_('Error! You cannot create a recursive hierarchy of tasks.'))

    # Sharjeel commented it
    # @api.model
    # def _add_magic_fields(self):
    #     super(Groups, self)._add_magic_fields()
    #
    #     def add(name, field):
    #         if name not in self._fields:
    #             self._add_field(name, field)
    #
    #     add(
    #         "parent_group",
    #         fields.Many2one(
    #             _module=self._module,
    #             comodel_name=self._name,
    #             string="Parent Group",
    #             ondelete="cascade",
    #             auto_join=True,
    #             index=True,
    #             automatic=True,
    #         ),
    #     )
    #     add(
    #         "child_groups",
    #         fields.One2many(
    #             _module=self._module,
    #             comodel_name=self._name,
    #             inverse_name="parent_group",
    #             string="Child Groups",
    #             automatic=True,
    #         ),
    #     )
    #     add(
    #         "groups",
    #         fields.Many2many(
    #             _module=self._module,
    #             comodel_name="res.groups",
    #             relation="{}_groups_rel".format(self._table),
    #             column1="gid",
    #             column2="rid",
    #             string="Groups",
    #             automatic=True,
    #         ),
    #     )
    #     add(
    #         "explicit_users",
    #         fields.Many2many(
    #             _module=self._module,
    #             comodel_name="res.users",
    #             relation="{}_explicit_users_rel".format(self._table),
    #             column1="gid",
    #             column2="uid",
    #             string="Explicit Users",
    #             automatic=True,
    #         ),
    #     )
    #     add(
    #         "users",
    #         fields.Many2many(
    #             _module=self._module,
    #             comodel_name="res.users",
    #             relation="{}_users_rel".format(self._table),
    #             column1="gid",
    #             column2="uid",
    #             string="Group Users",
    #             compute="_compute_users",
    #             store=True,
    #             automatic=True,
    #         ),
    #     )

    _sql_constraints = [
        ("name_uniq", "unique (name)", "The name of the group must be unique!")
    ]

    # ----------------------------------------------------------
    # Functions
    # ----------------------------------------------------------

    @api.model
    def default_get(self, fields_list):
        res = super(Groups, self).default_get(fields_list)
        if not self.env.context.get("groups_no_autojoin"):
            if "explicit_users" in res and res["explicit_users"]:
                res["explicit_users"] = res["explicit_users"] + [self.env.uid]
            else:
                res["explicit_users"] = [self.env.uid]
        return res

    # ----------------------------------------------------------
    # Read, View
    # ----------------------------------------------------------

    @api.depends(
        "parent_group", "parent_group.users", "groups", "groups.users", "explicit_users"
    )
    def _compute_users(self):
        for record in self:
            users = record.mapped("groups.users")
            users |= record.mapped("explicit_users")
            users |= record.mapped("parent_group.users")
            record.update({"users": users, "count_users": len(users)})