{
    'name': 'POS Restaurant Receipt',
    'version': '1.0',
    'category': 'Point of Sale',
    'summary': 'Manage Restaurant Point of Sale',
    'description': """ """,
    'author': 'SkyRocket',
    'website': "https://www.skyrocket.com.pk",
    'company': 'Sky Rocket Solutions',
    'depends': ['base','point_of_sale'],
    'data': [
    ],
    'assets': {
        'point_of_sale.assets': [
            'skyrocket_restaurant_receipt/static/src/**/*.xml',
            'skyrocket_restaurant_receipt/static/src/**/*.js',
            'skyrocket_restaurant_receipt/static/src/**/*.css',
        ],
    },
    # 'qweb': ['static/src/xml/receipt.xml'],
    'installable': True,
    'application': True,
    'auto_install': False,
}
