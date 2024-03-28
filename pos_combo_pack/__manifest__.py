{
    'name': 'POS combo Meal & Make My own Pizza',
    'category': 'Point of Sale',
    'author': 'Sky Rocket Solutions',
    'version': '13.0.1.0',
    'license': 'AGPL-3',
    'website': 'www.skyrocket.com.pk',
    'description':
        """
            Odoo_13.0.1.0 Restaurant Extention module.
            Make My Own Pizza Combo Meal
        """,
    'summary': "Make My Own Pizza and Combo Meal",
    'depends': ['base', 'point_of_sale', 'pos_restaurant'],
    'data': [
        'security/ir.model.access.csv',
        'security/security_group.xml',
        'views/pos_product_pack_view.xml',
        'views/combo_selective_product.xml',
        'views/combo_fixed_product.xml',
        'views/pos_order_line.xml'
    ],
    'assets': {
        'point_of_sale.assets': [
            'pos_combo_pack/static/src/css/pos_product_pack.css',
            'pos_combo_pack/static/src/js/pos_product_pack_file.js',
            'pos_combo_pack/static/src/js/ProductScreen.js',
            'pos_combo_pack/static/src/js/OwnPizzaScreen.js',
            'pos_combo_pack/static/src/lib/jquery-ui.js',
            'pos_combo_pack/static/src/xml/pos_view.xml',
            'pos_combo_pack/static/src/xml/pos_view_13.xml',
        ],
        },
    'price': 99,
    'currency': 'EUR',
    'auto_install': False,
    'installable': True,
}
