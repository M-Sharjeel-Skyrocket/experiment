odoo.define('pos_combo_pack.pos_product_pack_file', function (require) {
    "use strict";

    var PaymentScreen = require('point_of_sale.PaymentScreen');
    var { PosGlobalState, Orderline, Order } = require('point_of_sale.models');
    const { _lt } = require('@web/core/l10n/translation');
    var rpc = require('web.rpc');
    const { useListener } = require("@web/core/utils/hooks");
    const Registries = require('point_of_sale.Registries');
    var AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');

    // Load model and fields in py session.py

    // Own Pizza Popup is in separate File

    // Orderline Which show combo item and fixed after refresh screen
    const ComboItems = (Orderline) => class ComboItems extends Orderline {
        init_from_JSON (json){
            super.init_from_JSON(...arguments);
        	/*_super_order_line.init_from_JSON.apply(this,arguments);*/
        	var self = this
        	if(this.product.is_pack){
        		this.pack_data = []
        		let combo_ids = json.combo_ids;
        		_.each( JSON.parse(combo_ids.replace(/&quot;/ig,'"')), function(item){
        			item = item[2]
        			self.pack_data.push({
                        'product_id':self.pos.db.get_product_by_id(item.product_id),
                        'qty':item.qty,
                        });
                })
        	}

        	if(this.product.is_extra){
        		this.order_menu = json.order_menu
        	}
        }

        export_as_JSON (){
            var self = this;
            var own_line = [];
            var total_price = 0;
            var order_menu = [];
            var json = super.export_as_JSON(...arguments);

            //            var own_data = [];
            //            own_data.push({"product_id": self.env.pos.db.get_product_by_id(this.product.id), 'qty':1,'price':self.env.pos.db.get_product_by_id(this.product.id).lst_price});

            if(this.product.is_extra && this.product.own_data){
                _.each(this.own_data, function(item){
                    own_line.push([0, 0, {'product_id':item.product_id.id,
                      'name':item.product_id,
                      'qty':self.get_quantity(),
                      'price':item.price,
                      'price_subtotal_incl':0.0,
                      'price_subtotal':0.0,
                    }]);
                    total_price += item.price;
                });
                json.order_menu = this.order_menu;
            }
            if (this.product.is_extra){
                json.price_unit = total_price;
            }
            json.price_unit = this.price;
            json.is_extra = this.product.is_extra;
            json.own_ids = this.product.is_extra ? own_line : [];

            var combo_line = []
            if(self.product.is_pack && self.pack_data){
                _.each(self.pack_data, function(item){
                    combo_line.push([0, 0, {
                                        'product_id':item.product_id.id,
                                        'name':item.product_id.display_name,
                                        // 'qty':item.qty * self.get_quantity(),
                                        'qty':item.qty,
                                        'price_subtotal_incl':0.0,
                                        'price_subtotal':0.0,
                                    }]);
                })
            }
            json.is_pack = this.product.is_pack;
            json.combo_ids = this.product.is_pack ? JSON.stringify(combo_line) : [];
            return json;
        }

        // TODO Clone function is not nesscessary here for time being
        //        clone(){
        //            var orderline = Orderline.create({}, {
        //            orderline.pack_data = this.pack_data;
        //            orderline.combo_ids = this.combo_ids;
        //            orderline.is_pack = this.is_pack;
        //            orderline.is_extra = this.is_extra;
        //            });
        //            return orderline;
        //        }
    }
    Registries.Model.extend(Orderline, ComboItems);


    // Js Change for 16
    // ComboPackWidget PopUp Widget
    class ComboPack extends AbstractAwaitablePopup {
        setup() {
            super.setup();
            var self = this;
            this.data = this.props.data;
            this.fix_pack_data = this.props.fix_pack_data;
            this.main_product = this.props.main_product;
            this.qty_multiplier = 1;
            useListener('process_hnh', this.process_hnh);
            useListener('button-cancel', this.click_cancel);
        }

        add_qty() {
            var $target = $('button.add_qty');
            this.qty_multiplier = +$($target).prev().val() + 1
            $($target).prev().val(this.qty_multiplier);
        }

        minus_qty() {
            var $target = $('button.minus');
            if ($($target).next().val() > 1) {
                this.qty_multiplier = +$($target).next().val() - 1
                $($target).next().val(this.qty_multiplier);
            }
        }

        process_hnh(event){
            var $target = event.target;
            if ($($target).hasClass('hnh')) {
                var $place = $($target).closest('td').prev('td');
                var $select = $place.find('select.product_combo_select');
                $select.attr('data-qty', '0.5')
                $select.prop('required',true);
                $($select).toggleClass('width-50')
                $place.empty().append($select.clone(true),$select.clone(true));
                $($target).find('i').toggleClass('fa-angle-up fa-angle-down');
                $($target).toggleClass('hnh highlight')
            } else {
                var $place = $($target).closest('td').prev('td');
                var $select = $place.find('select.product_combo_select').first();
                $select.attr('data-qty', '1')
                $select.prop('required',false);
                $($select).toggleClass('width-100 width-50')
                $place.empty().append($select.clone(true));
                $($target).find('i').toggleClass('fa-angle-down fa-angle-up');
                $($target).toggleClass('hnh highlight')
            }
        }

        click_cancel(){ this.env.posbus.trigger('close-popup', {popupId: this.props.id});}

        async confirm(event) {
    		var self = this;
            var validation = true;
            var pack_data = [];
    		var product = self.env.pos.db.get_product_by_id(parseInt($(".combo_product_id").data('product_id')));

            _.each($(".product_combo_select"), function(p_s){
                if ($(p_s).val() == "Select Your Food...." && $(p_s).attr('required') == 'required') {
                    $(p_s).css('color', 'red');
                    $(p_s).focus();
                    validation = false;
                    $('.flavour-warning').show()
                }
            });

            if (validation){
                _.each($(".product_combo_select"),function(p_s){
                    if ($(p_s).selected && $(p_s).attr('required') && $(p_s).val() == "Select Your Food...."){
                        $(p_s).focus();
                    }
                    if($(p_s).val() != "Select Your Food....") {
                        pack_data.push({"product_id":self.env.pos.db.get_product_by_id(parseInt($(p_s).val())),
                            'qty':$(p_s).attr('data-qty'),})
                    }

                });
                await rpc.query({
                    model: 'fix.product.pack',
                    method: 'search_read',
                    fields: ['id', 'product_p_id', 'product_quantity'],
                }).then(function (result) {
                   _.each(result, function(pack){
                    // if( product.product_fix_pro_ids.indexOf(pack.products.id) >=0){
                    if( product.product_fix_pro_ids.indexOf(pack.id) >=0){
                        pack_data.push({"product_id":self.env.pos.db.get_product_by_id(pack.product_p_id[0]),
                                        'qty':pack.product_quantity,
                        })
                    }
                });
                });
                this.env.pos.get_order().add_product(product, {'merge':false, quantity: this.qty_multiplier});
                var current_order = this.env.pos.get_order().get_selected_orderline();
                if(current_order){
                    current_order.pack_data = pack_data;
                    current_order.set_selected();
                }
                this.click_cancel();
            }
        }
    }
    ComboPack.template = 'ComboPack';
    ComboPack.defaultProps = { cancelText: _lt('Cancel'), title: 'ComboPack', confirmText: _lt('Ok') };
    Registries.Component.add(ComboPack);
    // End Js here

    // Js Change for 16
    // Order Line Widget
    const PosFinalizeOrder = (Order) => class PosFinalizeOrder extends Order {
        constructor(obj, options) {
            super(...arguments);
            this.finalized_order = this.finalized_order || false;
        }

        export_as_JSON(){
            var json = super.export_as_JSON(...arguments);
            json.finalized_order = this.finalized_order;
            return json;
        }

        init_from_JSON(json){
            // super.init_from_JSON.call(this, json);
            super.init_from_JSON(...arguments);
            this.finalized_order = json.finalized_order;
        }
    }
    Registries.Model.extend(Order, PosFinalizeOrder);
    // End Js here

     // Js Change for 16
    // PaymentScreen Widget
    const ComboPaymentScreen = (PaymentScreen) => class ComboPaymentScreen extends PaymentScreen {
        async validateOrder(isForceValidate){
            super.validateOrder(...arguments);
            var order = this.env.pos.get_order();
            order.finalized_order = true;
        }
    };
    Registries.Component.extend(PaymentScreen, ComboPaymentScreen);
    // End Js

});
