{
    'name': 'Point of Sale Require Customer',
    'version': '13.0.0.0.0',
    'category': 'Point Of Sale',
    'summary': 'Point of Sale Require Customer',
    'author': 'SkyRocket',
    'website': 'https://www.skyrocket.com.pk',
    'license': 'AGPL-3',
    'depends': ['base', 'point_of_sale',],
    'data': [
        'security/ir.model.access.csv',
        'views/pos_config_view.xml',
        'views/res_partner_views.xml',
    ],
    'assets': {
        'point_of_sale.assets': [
            'pos_customer_required/static/src/**/*.css',
            'pos_customer_required/static/src/**/*.js',
            'pos_customer_required/static/src/**/*.xml',
            'pos_customer_required/static/src/lib/easy-autocomplete/easy-autocomplete.css',
            'pos_customer_required/static/src/lib/easy-autocomplete/easy-autocomplete.min.css',
            'pos_customer_required/static/src/lib/easy-autocomplete/easy-autocomplete.themes.css',
            'pos_customer_required/static/src/lib/easy-autocomplete/easy-autocomplete.themes.min.css',
            'pos_customer_required/static/src/lib/easy-autocomplete/jquery.easy-autocomplete.js',
            'pos_customer_required/static/src/lib/easy-autocomplete/jquery.easy-autocomplete.min.js',
        ],
        'web.assets_frontend': [

        ]
    },
    'installable': True,
}
