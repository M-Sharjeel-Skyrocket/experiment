# -*- coding: utf-8 -*-

from odoo import models


class PosOrder(models.Model):
    _inherit = "pos.order"


class PosSession(models.Model):
    _inherit = "pos.session"
