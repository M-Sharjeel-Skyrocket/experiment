odoo.define('pos_customer_required.customer_screen_widget', function(require){
    "use strict";

    var core = require('web.core');
    var rpc = require('web.rpc');
    var framework = require('web.framework');
    var _t = core._t;
    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const Registries = require('point_of_sale.Registries');
    const ActionpadWidget = require('point_of_sale.ActionpadWidget');
    const { useListener } = require("@web/core/utils/hooks");
    const { useBus } = require('@web/core/utils/hooks');
    const PosComponent = require('point_of_sale.PosComponent');
    const { useState } = owl;



    // CustomerPopUpWidget
     class CustomerPopUpWidget extends AbstractAwaitablePopup {
        setup() {
            super.setup();
            useListener('change_other_address', this.onchange_other_address);

            this.state = useState({
                customer_phone: this.env.pos.get_order().get_partner() ? this.env.pos.get_order().get_partner().phone : '',
                customer_secondary_phone: this.env.pos.get_order().get_partner() ? this.env.pos.get_order().get_partner().mobile : '',
                customer_name: this.env.pos.get_order().get_partner() ? this.env.pos.get_order().get_partner().name : '',
                customer_address: this.env.pos.get_order().get_partner() ? this.env.pos.get_order().get_partner().street : '',
                customer_secondary_address: this.env.pos.get_order().get_partner() ? this.env.pos.get_order().get_partner().street2 : '',
            });
            this.refresh_page_changes();
        }

        async loadDataAsync(partner) {
            $(document).ready(function() {
                var $OtherAddress = $("#other_address");
                $OtherAddress.empty();
                if (partner) {
                    $(".customer-input").prop("disabled", true);
                    $("#secondary_phone").prop("disabled", false);
                    $("#customer_name").prop("disabled", false);
                    $("#new_address").prop("disabled", false);
                    $OtherAddress.show();
                    $(".new_address").show();
                    if (partner.partner_addresses_array != false) {
                        var addresses = JSON.parse(partner.partner_addresses_array.replace(/&quot;/ig,'"'))
                        if (addresses.length) {
                            $OtherAddress.append("<p>Other Delivery Addresses: (" + addresses.length + ")</p>")
                            addresses.forEach(function(address) {
                                var string = "<input type='radio' class='other_address' id='"+ address + "'name='other_address' value='"+ address +"' /> ";
                                string = string + "<label for='"+ address +"'>"+ address +"</label><br/>";
                                $OtherAddress.append(string)
                            });
                        }
                    }
                } else {
                    $OtherAddress.hide();
                    $(".customer-input").val("");
                    $(".customer-input").prop("disabled", false);
                }
            });
        }


         // Done
         async refresh_page_changes() {
         var self = this;
         var partner = await this.env.pos.get_order().get_partner() ? this.env.pos.get_order().get_partner() : null;
         await this.loadDataAsync(partner);

//            $(document).ready(function() {
//                async function loadDataAsync() {
//                    var $OtherAddress = $("#other_address");
//                    $OtherAddress.empty();
//                    if (partner) {
//                        $(".customer-input").prop("disabled", true);
//                        $("#secondary_phone").prop("disabled", false);
//                        $("#customer_name").prop("disabled", false);
//                        $("#new_address").prop("disabled", false);
//                        $OtherAddress.show();
//                        $(".new_address").show();
//                        if (partner.partner_addresses_array != false) {
//                            var addresses = JSON.parse(partner.partner_addresses_array.replace(/&quot;/ig,'"'))
//                            if (addresses.length) {
//                                $OtherAddress.append("<p>Other Delivery Addresses: (" + addresses.length + ")</p>")
//                                addresses.forEach(function(address) {
//                                    var string = "<input type='radio' class='other_address' id='"+ address + "'name='other_address' value='"+ address +"' t-on-input='onchange_other_address' /> ";
//                                    string = string + "<label for='"+ address +"'>"+ address +"</label><br/>";
//                                    $OtherAddress.append(string)
//                                });
//                            }
//                        }
//                    } else {
//                        $OtherAddress.hide();
//                        $(".customer-input").val("");
//                        $(".customer-input").prop("disabled", false);
//                    }
//                }
//            });
        }

        // Done
        reset_customer() {
            this.env.pos.get_order().set_partner();
            this.refresh_page_changes();
        }

        // Done
        onchange_other_address() {
            var all_check = document.getElementsByName('other_address');
            var checked;
            for(var i = 0; i < all_check.length; i++){
                if(all_check[i].checked){
                    checked = all_check[i].value;
                }
            }
            const element = document.getElementById("customer_address");
            if (element){
                element.value = checked;
            }
        }


        verify_customer(ev, keys) {
            var self = this;
            var $customer_field = $(".customer_phone");

            var partners = _.map(this.env.pos.db.get_partners_sorted(), function(partner) {
                return {
                    id: partner.id,
                    text: (partner.name || '') + "<br />"+(partner.street || ''),
                    name: partner.name || '',
                    phone: partner.phone || '',
                    mobile: partner.mobile || '',
                    street: partner.street || ''
                }
            })

            var options = {
              data: partners,
              getValue: "phone",
              template: {
                type: "description",
                fields: {
                    description: "text"
                }
              },
              list: {
                maxNumberOfElements: 10,
                 match: {
                    enabled: true
                },
                onChooseEvent: function() {
                  var selected_partner = $customer_field.getSelectedItemData();

                  if (selected_partner.id) {
                      $("#customer_name").val(selected_partner.name).trigger("change");
                      $("#secondary_phone").val(selected_partner.mobile).trigger("change");
                      $("#customer_address").val(selected_partner.street).trigger("change");
                      self.env.pos.get_order().set_partner(selected_partner);
                      var partner = self.env.pos.db.get_partner_by_id(selected_partner.id);

                    if (self.env.pos.get_order().get_partner() !== partner) {
                        self.env.pos.get_order().set_partner(partner);
                        $('#customer_name').focus();
                    }
                    self.refresh_page_changes();
                  }
                },
              },
              theme: "bootstrap",
              adjustWidth: false,
            };

            $customer_field.easyAutocomplete(options).focus();

            //             if (ev.data != ''){
            //                  if (!ev.data.match(/[a-zA-Z0-9]/)) {
            //                    ev.preventDefault();
            //                 }
            //             }
        }
            // this.env.pos.get_order().get_partner() ? this.env.pos.get_order().get_partner().phone : ''
            //            var order = this.env.pos.get_order();
            //            $(document).ready(function () {
            //                if (order.partner && ev.key != 'Enter') {
            //                    order.set_partner(order.partner);
            //                    $('#customer_name').val('');
            //                    $('#secondary_phone').val('');
            //                    $('#customer_address').val('');
            //                }
            // if (!ev.key.match(/[a-zA-Z0-9]/)) {
            // ev.preventDefault();
            // }
            //            });
            //        }

        //@override
        async confirm() {
            var self = this;
            var name = $('#customer_name').val();
            var address = $('#customer_address').val();
            var phone = $('#customer_phone').val();
            var secondary_phone = $('#secondary_phone').val();
            var new_address = $('#new_address').val();
            var order = self.env.pos.get_order();

            if (phone.length != 11){
                alert(_t("Invalid Phone Number. Allowed format 03123456789."));
                return;
            }

            if (name.length < 2){
                alert(_t("Please write proper name."));
                return;
            }

            if (secondary_phone.length) {
                if (secondary_phone.length != 11) {
                    alert(_t("Invalid Secondary Number. Allowed format 03123456789."));
                    return;
                }
            }

            framework.blockUI();
            var id = this.env.pos.get_order().get_partner() ? this.env.pos.get_order().get_partner().id : false;
            rpc.query({
                model: 'res.partner',
                method: 'create_update_select',
                args: [id, name, address, new_address, phone, secondary_phone, this.env.pos.company.id]
            },{
                shadow: true,
            }).then(function(result){
                self.reload_partners(result).then(function() {
                    self.env.pos.get_order().set_partner(self.env.pos.db.get_partner_by_id(result));
                    framework.unblockUI();
                    self.env.posbus.trigger('close-popup', {popupId: self.props.id,});
                });
            }).catch(function(error){
                framework.unblockUI();
                self.env.pos.show_popup('error',{
                    'title': _t('Offline Mode'),
                    'body':  _t('Updation and Creation of Customers are not allowed in Offline Mode. But the previous state of the customer will be set to process.'),
                });
            })
        }

        // This fetches partner changes on the server, and in case of changes,
        // rerenders the affected views
        reload_partners(partner_id) {
            return this.env.pos.load_new_partners();
        }

            //        click_cancel(){
            //        window.history.go(-1);
            //        }

     }
     CustomerPopUpWidget.template = 'CustomerPopUp';
     CustomerPopUpWidget.defaultProps = {confirmText: _t('Confirm'), cancelText: _t('Cancel') };

     Registries.Component.add(CustomerPopUpWidget);
     return CustomerPopUpWidget;


//    const ProductScreenExtend = (ProductScreen) => class extends ProductScreen {
//        setup() {
//            var self = this;
//            super.setup();
//            if (this.env.pos.config.prompt_customer && this.env.pos.get_order()) {
//                if (this.env.pos.get_order().get_orderlines().length == 0 && !this.env.pos.get_order().get_partner){
//                    this.showPopup('CustomerPopUpWidget', {});
//                }
//            }
//        }
//
//            //        show() {
//            //            var self = this;
//            //            this._super();
//            //            if (this.env.pos.config.prompt_customer && this.env.pos.get_order()) {
//            //                if (this.env.pos.get_order().get_orderlines().length == 0 && !this.env.pos.partner){
//            //                    this.showPopup('CustomerPopUpWidget', {});
//            //                }
//            //            }
//            //        }
//    };
//
//    Registries.Component.extend(ProductScreen, ProductScreenExtend);
//    return ProductScreen;

});
