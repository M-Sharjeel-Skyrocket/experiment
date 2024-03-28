# -*- coding: utf-8 -*-

from functools import partial

from odoo import models, fields


class PosOrderReport(models.Model):
    _inherit = "report.pos.order"

    rider_id = fields.Many2one('hr.employee', string='Rider', readonly=True)
    waiter_id = fields.Many2one('hr.employee', string='Rider', readonly=True)

    def _select(self):
        return super(PosOrderReport, self)._select() + ',s.rider_id AS rider_id, s.waiter_id AS waiter_id'

    def _group_by(self):
        return super(PosOrderReport, self)._group_by() + ',s.rider_id, s.waiter_id'
