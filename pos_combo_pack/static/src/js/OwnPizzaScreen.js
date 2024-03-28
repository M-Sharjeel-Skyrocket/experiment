odoo.define('pos_combo_pack.OwnPizza', function (require) {
    "use strict";

    var { PosGlobalState, Orderline } = require('point_of_sale.models');
    var _t  = require('web.core')._t;
    const { _lt } = require('@web/core/l10n/translation');
    var core = require('web.core');
    var utils = require('web.utils');
    var rpc = require('web.rpc');
    const Registries = require('point_of_sale.Registries');
    var AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');

    // Js Change for 16
    // OwnPizzaWidget Pop up Widget
    class OwnPizzaWidget extends AbstractAwaitablePopup {
        setup() {
            super.setup();
            var self = this;
            this.data = self.props.data;
            this.main_product = self.props.main_product
            this.order_menu = self.props.order_menu;
            this.counter = 0
        }

        clickProduct(){
            var self = this;
            this.data = self.props.data;
            this.main_product = self.props.main_product
            var order_menu = [];
            if(self.counter > 0){
                console.log("inside the counter")
            }
            else{
            $(".pos_topp_product").click(function(){
                var product_id = $(this).data('product-id');
                var category_id = $(this).data('category-id');
                var multi_selection = document.getElementsByClassName('multi_selection')[0].innerText;
                var category = self.env.pos.db.get_category_by_id(category_id);
                var product = self.env.pos.db.get_product_by_id(product_id);
                var allow = true

                for(var i=0;i<order_menu.length;i++){
                    if(category_id == order_menu[i].categoryId){
                        var allow2 = true;
                        for(var j=0;j<order_menu[i].products.length;j++){

                            if(order_menu[i].products[j].product_id == product_id){
                                order_menu[i].products.splice(j, 1)
                                allow2 = false;
                                $(this).removeClass("green_border");
                            }
                        }


                        if(order_menu[i].products.length > 0 && multi_selection == false){
                            alert("You can select only one item.");
                        }
                        else {
                            if(allow2){
                                order_menu[i].products.push({'product_id':product_id,'product_name':product.display_name,'price':product.lst_price});
                                $(this).addClass("green_border");
                            }
                        }
                        allow = false;
                    }

                    if(order_menu[i].products.length <= 0){
                        order_menu.splice(i, 1)
                    }
                }

                if(allow){
                    $(this).addClass("green_border");
                    order_menu.push({'categoryId':category_id,'categoryName':category.name,'products':[{'product_id':product_id,'product_name':product.display_name,'price':product.lst_price}]});
                }

                self.display_order_line(order_menu);
                self.order_menu = order_menu;
            })
            };
            self.counter+= 1;
        }

        display_order_line(order_menu){
            var html_text = "<table width='100%'>"
            var total_price = 0;
            for(var i=0;i<order_menu.length;i++){
                html_text += "<tr><td style='float:left'><b style='font-size: 11px;color: black'>"+order_menu[i].categoryName+"</td></b><td></td></tr>";
                for(var j=0;j<order_menu[i].products.length;j++){
                    html_text += "<tr><td style='float:left;margin-left: 10px;'>"+order_menu[i].products[j].product_name+"</td><td style='float:right;margin-right: 10px;'>"+(order_menu[i].products[j].price.toFixed(2))+"</td></tr>";
                    total_price += order_menu[i].products[j].price;
                }
            }
            html_text += "</table>"
            $(".order-menu").html(html_text);
            $(".total-pricel").html(total_price);
        }

        async confirm(){
            var self = this;
            var own_data = [];
            var selection = [];
            var order_menu = this.order_menu;
            var total_price = 0;

            for(var i=0; i<order_menu.length; i++){
                for(var j=0; j<order_menu[i].products.length; j++){
                    var product_id = order_menu[i].products[j].product_id
                    own_data.push({"product_id": self.env.pos.db.get_product_by_id(parseInt(product_id)), 'qty':1,'price':self.env.pos.db.get_product_by_id(parseInt(product_id)).lst_price});
                    total_price += self.env.pos.db.get_product_by_id(product_id).lst_price;
                }
            }

            var product = this.env.pos.db.get_product_by_id(parseInt($(".main_product_id").data('product_id')));
            this.env.pos.get_order().add_product(product,{'price':total_price, 'merge':false});
            var order = this.env.pos.get_order().get_selected_orderline();
            if(order){
                order.own_data = own_data;
                order.order_menu = order_menu;
                order.set_selected();
            }
            this.env.posbus.trigger('close-popup', {popupId: this.props.id})
        }
    }

    OwnPizzaWidget.template = 'OwnPizzaWidget';
    OwnPizzaWidget.defaultProps = { cancelText: _lt('Cancel'),title: 'Make own  Pizza', confirmText: _lt('Ok') };
    Registries.Component.add(OwnPizzaWidget);
    // End Js here
});
