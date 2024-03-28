# -*- coding: utf-8 -*-

{
    "name" : "Pos Cash In Out",
    "version" : "13.0.0.0",
    "category" : "Point of Sale",
    "depends" : ['base','sale','account','point_of_sale'],
    "author": "SkyRocket",
    'summary': '',
    "description": """ POS Expense Module """,
    "website" : "https://www.skyrocket.com.pk",
    "data": [
        'security/cash_in_out_security.xml',
        'security/ir.model.access.csv',
        'data/sequence.xml',
        'views/custom_pos_view.xml',
    ],
    'qweb': [
        # 'static/src/xml/pos.xml',
        'static/src/xml/pos_inherit.xml',
    ],
    "auto_install": False,
    "installable": True,
    "images":['static/description/Banner.png'],
}

