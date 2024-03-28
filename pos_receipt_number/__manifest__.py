# -*- coding: utf-8 -*-
{
    'name': "POS Custom Receipt Number",
    'summary': "POS Custom Receipt Number",
    'description': "POS Custom Receipt Number.",
    'author': 'Aadeel Singapuri',
    'company' : 'Sky Rocket',
    'website' : "https://www.skyrocket.com.pk",
    'category': 'Point of Sale',
    'version': '1.0',
    'license': 'LGPL-3',
    "images":["static/description/logo.PNG"],
    'depends': ['base', 'point_of_sale', 'pos_restaurant'],
    'data': [
        # 'views/pos_order_view.xml',
        # 'views/pos_session_view.xml',
    ],
    "assets": {
        "point_of_sale.assets": [
        "pos_receipt_number/static/src/js/OrderWidget.js",
        # "pos_receipt_number/static/src/xml/pos.xml",
        "pos_receipt_number/static/src/js/pos_receipt_number.js"
        ],
    }
}