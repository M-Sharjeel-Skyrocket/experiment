odoo.define('pos_multi_variant.ProductScreen', function(require) {
    'use strict';
    /* This JavaScript code extends the ProductScreen class from the point_of_sale module.
     * It adds functionality for handling product clicks and displaying the ProductsPopup
     * for selecting variants.
     */
    var ProductScreen = require('point_of_sale.ProductScreen');
    const Registries = require('point_of_sale.Registries');
    const NumberBuffer = require('point_of_sale.NumberBuffer');
    var rpc = require('web.rpc');
    const {Gui} = require("point_of_sale.Gui");

    const ProductScreenExtend = (ProductScreen) => class extends ProductScreen {
        constructor() {
            super(...arguments);
        }

        get_product_by_ids(product_ids){
            var list = [];
            var length_of_ids = product_ids.length;
            if (product_ids) {
                for (var i = 0, len = product_ids.length ; i < len; i++) {
                    list.push(this.env.pos.db.get_product_by_id(product_ids[i]));
                }
            }
            return list;
        }

        async _clickProduct(event) {
            self = this;
            if (!this.currentOrder) {
                this.env.pos.add_new_order();
            }
            const product = event.detail;
            const options = await this._getAddProductOptions(product);
            if (product.is_pack) {
                const product = event.detail;
                var data = ''
                var fix_pack_data = [];

                await rpc.query({
                    model: 'product.pack',
                    method: 'search_read',
                    fields: ['id','product_categ_id','hnh','required_item','product_selection','product_quantity'],
                }).then(function (result) {
                    data = result.map(pack => {
                        if (product.product_pack_id.includes(pack.id)) {
                            return {
                                'category': pack.product_categ_id,
                                'hnh': pack.hnh,
                                'required_item': pack.required_item,
                                'categ_id': pack.id,
                                'products': self.get_product_by_ids(pack.product_selection),
                                'qty': pack.product_quantity
                            };
                        }
                        }).filter(item => item !== undefined);
                    });

                await rpc.query({
                    model: 'fix.product.pack',
                    method: 'search_read',
                    fields: ['id', 'product_p_id', 'product_quantity'],
                }).then(function (result) {
                    _.each(result, function(pack){
                        if( product.product_fix_pro_ids.indexOf(pack.id) >=0){
                            fix_pack_data.push({'products':self.env.pos.db.get_product_by_id(pack.product_p_id[0]),
                                'qty': pack.product_quantity})
                        }
                    });
                });
                var title = product.display_name;
                this.showPopup('ComboPack',{'fix_pack_data': fix_pack_data, 'data': data,'main_product':product.id, 'title': title });
            }
            else if (product.is_extra) {
                var data = [];
                await rpc.query({
                    model: 'product.extra.topping',
                    method: 'search_read',
                    fields: ['id', 'product_categ_id', 'multi_selection'],
                }).then(function (result) {
                   _.each(result, function(extra){
                    if (product.product_extra_id.indexOf(extra.id) >=0){
                        data.push({'category':extra.product_categ_id[1],
                                   'categ_id':extra.product_categ_id[0],
                                   'multi_selection':extra.multi_selection,
                                   'products':self.env.pos.db.get_product_by_category(extra.product_categ_id[0]),
                                   'qty':extra.product_quantity })
                        }
                    });
                });
                this.showPopup('OwnPizzaWidget', {'data':data, 'main_product':product.id });
            }
            else{
                await this._addProduct(product, {});
            }
        }
    }
    Registries.Component.extend(ProductScreen, ProductScreenExtend);
    return ProductScreen;
});
