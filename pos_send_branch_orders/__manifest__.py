# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': "Point of Sale - Send orders to branch/company point of sale",
    'category': "Hidden",
    'summary': 'Link module between Point of Sale multi company',

    'description': """
    This module allows you to create and send orders to other branch/company point of sale 
    """,

    'depends': ['base', 'point_of_sale', 'pos_restaurant'],

    'data': [
        # 'views/pos_order_view.xml',
        # 'views/pos_restaurant_view.xml',
        # 'views/res_partner.xml',
    ],
    'installable': True,
    'auto_install': False,
    'assets': {
        'point_of_sale.assets': [
            # 'pos_send_branch_orders/static/src/xml/pos.xml',
            # 'pos_send_branch_orders/static/src/xml/HeaderBell.xml',
            'pos_send_branch_orders/static/lib/multi-select/jquery.multiselect.js',
            'pos_send_branch_orders/static/src/js/models.js',
            'pos_send_branch_orders/static/src/js/screens.js',
            'pos_send_branch_orders/static/src/js/chrome.js',
            'pos_send_branch_orders/static/lib/multi-select/jquery.multiselect.css',
            'pos_send_branch_orders/static/src/css/style.css',
            'pos_send_branch_orders/static/lib/fontawesome/css/font-awesome-animation.min.css'

        ]
    }
}
