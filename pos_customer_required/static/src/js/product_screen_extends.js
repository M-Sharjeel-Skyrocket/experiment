odoo.define('pos_customer_required.product_screen_extend', function(require){
    "use strict";

    const ProductScreen = require('point_of_sale.ProductScreen');
    const Registries = require('point_of_sale.Registries');
    const ActionpadWidget = require('point_of_sale.ActionpadWidget');

    const ProductScreenExtend = (ProductScreen) => class extends ProductScreen {
        setup() {
            var self = this;
            super.setup();
            if (this.env.pos.config.prompt_customer && this.env.pos.get_order()) {
                if (this.env.pos.get_order().get_orderlines().length == 0 && !this.env.pos.get_order().get_partner()){
                    this.showPopup('CustomerPopUpWidget', {});
                }
            }
        }
    };

    Registries.Component.extend(ProductScreen, ProductScreenExtend);
    return ProductScreen;
});
