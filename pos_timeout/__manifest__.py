{
    "name": "Point of Sale - Timeout",
    "summary": "Set the timeout of the point of sale",
    "version": "13.0.1.0.1",
    "category": "Sales/Point Of Sale",
    "website": "https://skyrocket.com.pk/",
    "author": "SkyRocket",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "images": ["static/description/pos_config.png"],
    "data": ["views/view_pos_config.xml"],
    'assets': {
        'point_of_sale.assets': [
            'pos_timeout/static/src/**/*.png',
            'pos_timeout/static/src/**/*.js',
        ],
    },
    "installable": True,
}
