odoo.define('pos_send_branch_orders.chrome', function (require) {
    "use strict";
//
//    var PosBaseWidget = require('point_of_sale.BaseWidget');
//    const HeaderButton = require('point_of_sale.HeaderButton');
//    var gui = require('point_of_sale.gui');
//    var PopupWidget = require('point_of_sale.popups');
//    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
//    const PosComponent = require('point_of_sale.PosComponent');
//    var session = require('web.session');
//    const Chrome = require('point_of_sale.Chrome');
//    const Registries = require('point_of_sale.Registries');
//    var core = require('web.core');
//    var rpc = require('web.rpc');
//    var _t = core._t;
//    var _lt = core._lt;
//    var QWeb = core.qweb;
//    const { useState } = owl;
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');

    const { onPatched, onMounted, onWillUnmount, useRef, useState } = owl;

//    class HeaderBell extends PosComponent {
//        setup() {
//            super.setup();
//            this.state = useState({ isMouseOver: false,counter: 0 });
////        init: function(parent, options) {
////            this._super(parent, options);
//            this.icon = 'fa-bell';
//            this.icon_color = 'grey';
//            this.icon_color_ringer = 'yellow';
//            this.icon_mouseover = 'fa-bell-o';
////            this.icon_color_mouseover = 'red';
////            this.bell_counter = $('<span />',).attr({
////                class: 'oe_hidden bell_counter'
////            }).text(0)
//            this.ringer = '';
//            this.reloaded_partners = [];
////            onMounted(this.onMounted);
//        }
//
//        onMouseOver(isMouseOver) {
//            this.state.isMouseOver = isMouseOver;
////            this.state.title = isMouseOver ? 'Lock' : 'Unlocked';
//        }
//
////        onMounted() {
//////            await super.willStart();
////            let audio = new Audio('https://upload.wikimedia.org/wikipedia/commons/3/34/Sound_Effect_-_Door_Bell.ogg');
////            this.ringer = audio
//////            this.el.append(this.bell_counter)
////////            this.renderElement()
////            setInterval(this._project_alerts.bind(this), 20000);
//////            return this._super();
////        }
////    mounted() {
////        super.mounted();
////            var self = this;
//////            this._super();
////            this.iconElement = this.$el.find("i");
////            this.$el.css('font-size','20px');
////            this.iconElement.addClass(this.icon);
////            this.$el.css('color',this.icon_color);
////            this.$el.mouseover(function(){
////                self.iconElement.addClass(self.icon_mouseover).removeClass(self.icon);
////                $(this).css('color', self.icon_color_mouseover);
////            }).mouseleave(function(){
////                self.iconElement.addClass(self.icon).removeClass(self.icon_mouseover);
////                $(this).css('color', self.icon_color);
////            });
////            this.$el.append(this.bell_counter)
////        }
//
////       async _project_alerts() {
////            var self = this;
////            await this.env.services.rpc({
////                model: 'pos.config',
////                method: 'get_unprinted_orders',
////                args: [this.env.pos.pos_session.id],
////            })
////            .then(function (result){
//////            console.log(result)
////                if (result.message) {
//////                    self.$('.bell_counter').removeClass('oe_hidden').html(result.count);
//////                    self.$el.find("i").addClass('faa-ring animated faa-slow');
//////                    self.$el.css('color',self.icon_color_ringer);
////                    self.el.querySelector('i').style.color = self.icon_color_ringer;
////                    self.state.counter = result.count;
////                    self.ringer.play();
//////                    if (result.orders.length) {
//////                        result.orders.forEach(function(order) {
//////                            if (self.reloaded_partners.includes(order.order_id) -1) {
//////                                self.pos.load_new_partners_force_update(order.partner_id)
//////                                self.reloaded_partners.push(order.order_id)
//////                            }
//////                        });
//////                    }
////}
//////                } else {
////////                    $('.bell_counter').addClass('oe_hidden').html(result.count);
////////                    self.$el.find("i").removeClass('faa-ring animated faa-slow');
////////                     self.ringer.play();
//////
////////                    self.$el.css('color',self.icon_color);
//////                }
////            });
////        }
//    }
//    HeaderBell.template = "HeaderBell";
//    Registries.Component.add(HeaderBell);
//    Registries.Component.extend(HeaderButton, HeaderBellButtonWidget);
//END
//    class CCOrdersPopUpWidget extends AbstractAwaitablePopup {
//        setup() {
//            super.setup();
////        init: function(parent, options){
////            this._super(parent, options);
//            this.columns_to_show = [];
//            useListener('click', '.button.cancel', this.click_cancel);
//            useListener('click', '.button.refresh_data', this.click_refresh);
//            useListener('change', 'select[multiple]', this.visible_columns);
//        }
//        mounted() {
//            super.mounted();
//            // Initialize your selectpicker here if necessary
//            // Note: You might need to use a different approach than jQuery if it's not supported in your setup
//            $(this.selectRef.el).multiselect({
//                columns: 1,
//                placeholder: 'Select Columns To Show'
//            });
//            this.get_cc_orders(this.state.columns_to_show);
//        }
//        visible_columns (event) {
//            this.columns_to_show = $('.selectpicker-multi option:selected')
//                                .toArray().map(item => item.value);
//            this.get_cc_orders(this.columns_to_show)
//
//        }
//        render_cc_orders (orders){
//            var $Destination = $('#cc-orders');
//            $Destination.empty()
//            if (orders.count > 0) {
//                var $table = ""
//                $table += "<table class='table table-sm table-bordered cc-orders-table'>"
//                $table += "<thead>"
//                $table += "<tr>"
//                for(var key in orders.orders[0]) {
//                    $table += "<td>"
//                    $table += key
//                    $table += "</td>"
//                }
//                $table += "</tr>"
//                $table += "</thead>"
//                $table += "<tbody>"
//                orders.orders.forEach(function(order){
//                    $table += "<tr>"
//                    for (const [key, value] of Object.entries(order)) {
//                        $table += "<td>"
//                        $table += value
//                        $table += "</td>"
//                    }
//                    $table += "</tr>"
//                })
//                $table += "</tbody>"
//                $table += "</table>"
//                $Destination.append($table)
//            }
//        }
//        get_cc_orders (columns){
//            var self = this;
//
//            rpc.query({
//                model: 'pos.order',
//                method: 'fetch_cc_orders',
//                args: [self.pos.pos_session.id, columns],
//                kwargs: {context: session.user_context},
//            }).then(function (result) {
//                self.render_cc_orders(result)
//            }).catch(function(err,event){
//                console.log(err,event)
//                var err_msg = 'Please check the Internet Connection.';
//
//                this.showPopup('ErrorPopup', {
//                    title: this.env._t('Error: Could not get order details.'),
//                    body: this.env._t(err_msg)
//                });
////                self.gui.show_popup('alert',{
////                    'title': _t('Error: Could not get order details.'),
////                    'body': _t(err_msg),
////                });
//            });
//        }
//        click_refresh (){
//            this.get_cc_orders(this.columns_to_show);
//        }
//        click_cancel (){
//            this.cancel();
//        }
//
//    };
//    CCOrdersPopUpWidget.template = 'CCOrdersPopUpWidget',
//    //End
//       ControlButtonPopup.defaultProps = {
//        cancelText: _lt('Back'),
//        controlButtons: [],
//        confirmKey: false,
//    };
//     Registries.Component.add(CCOrdersPopUpWidget);
////    gui.define_popup({name:'cc_orders_pop_up_widget', widget: CCOrdersPopUpWidget});
//
//    class CallCenterOrdersButton extends PosComponent{
////        template: 'CallCenterOrdersButton',
////        start: function(){
////            var self = this;
////            this.$el.click(function(){
////                self.gui.show_popup('cc_orders_pop_up_widget', null);
////            });
////        },
//        constructor() {
//            super(...arguments);
//            useListener('click', this.onClick);
//        }
//
//        onClick() {
//           this.showPopup('cc_orders_pop_up_widget');
//        }
//
//    };
//    CallCenterOrdersButton.template = 'CallCenterOrdersButton';
//
//    Registries.Component.add(CallCenterOrdersButton);

//        const PosSendBranchChrome = (Chrome) =>
//        class extends Chrome {
//        bell_button_widget() {
//            'name':   'bell_button',
//            'widget': HeaderBellButtonWidget,
//            'append':  '.pos-rightheader',
//        },
//        call_center_orders_button: {
//            'name':   'call_center_orders',
//            'widget': CallCenterOrdersButton,
//            'append':  '.pos-branding',
//            'condition': function(){ return this.pos.config.is_call_center; },
//        },
//
//        build_widgets: function() {
//            var self = this;
//                this.widgets.some(function(widget, index){
//                    if (widget.name === 'close_button'){
//                        self.widgets.splice(index, 0, self.bell_button_widget);
//                        self.widgets.splice(index, 0, self.call_center_orders_button);
//
//                            return true;
//                    }
//                    return false;
//                });
//            this._super();
//        },
//    };
//    Registries.Component.extend(Chrome, PosSendBranchChrome);
//    return HeaderBell;
});
