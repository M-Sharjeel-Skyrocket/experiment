odoo.define('pos_expense_module.pos', function(require) {
	"use strict";

	var models = require('point_of_sale.models');
	var screens = require('point_of_sale.screens');
	var core = require('web.core');
	var gui = require('point_of_sale.gui');
	var popups = require('point_of_sale.popups');
	var rpc = require('web.rpc');
    var field_utils = require('web.field_utils');

	var QWeb = core.qweb;
	var _t = core._t;


    // Defining the button in Point of Sale
    screens.CashInOutButton = screens.ActionButtonWidget.extend({
	    template:'CashInOutButton',
	    button_click: function(){
	        this.gui.show_popup("cash_in_out_widget_screen");
	    }
	});

	 screens.define_action_button({
        name: "cash_in_out_widget_button",
        widget: screens.CashInOutButton,
        condition: function() {
            return true;
        },
    });

    // Defining the button action in Point of Sale
    screens.CashInOutWidget = screens.ScreenWidget.extend({
        template: "CashInOutWidget",
        init: function(parent, args) {
            this._super(parent, args);
            this.options = {};
            rpc.query({
                model:"account.account",
                method: 'search_read',
                args: [[["internal_group", "=", "expense"], ["company_id", "=", this.pos.config.company_id[0]], ["id", 'in', this.pos.config.expense_accounts_ids]]],
            }).then(function(result){
                var get_expense_list = result;
                for (let i = 0; i < get_expense_list.length; i++) {
                    $('#pos_expense_list').append(new Option(result[i].name, result[i].id));
                }
            });
        },
        show: function() {
            this._super();
            var session_id = this.pos.pos_session.id;
            rpc.query({
                model: 'cash.box.out',
                method: 'amount_in_till',
                args: [session_id]
            }).then(function(result){
                var amount_in_till = result;
                $('#amount_in_till').empty();
                $('#amount_in_till').append(' ' + amount_in_till + ' Rs.');
            });
        },
        events: {
            'click .button.cancel':  'click_cancel',
            'click .cash_in': 'cash_in',
            'click .cash_out': 'cash_out',
            'click .cash_in_out_summary': 'cash_in_out_summary'
        },
        click_cancel: function(){
            this.gui.close_popup();
        },
        cash_in: function () {
            var order = this.pos.get_order();
			var self = this;
            this.gui.show_popup('cash_in_popup_widget', {});
        },

        cash_out: function(){
            var order = this.pos.get_order();
			var self = this;
            this.gui.show_popup('cash_out_popup_widget', {});
        },

        cash_in_out_summary: function() {
            var order = this.pos.get_order();
			var self = this;
			this.gui.show_popup('cash_statement_popup_widget', {});
        }

    });

    gui.define_popup({
        name: "cash_in_out_widget_screen",
        widget: screens.CashInOutWidget,
    });

	// Popup start
	var CashOutPopupWidget = popups.extend({
		template: 'CashOutPopupWidget',
		init: function(parent, args) {
			this._super(parent, args);
			this.options = {};
		},

		events: {
			'click #apply_cash_out': 'cash_out',
			'click .button.cancel': 'click_cancel',
		},

		//
		show: function(options) {
			var self = this;
			this._super(options);
			$('#error').hide();
		},
		//

		renderElement: function() {
			var self = this;
			this._super();
			$('#error').hide();
		},

		save_summary_details: function(operation, entered_reason, entered_amount, account_id, rpc_data){
			var self = this;
			this.gui.close_popup();
			self.gui.show_screen('cash_in_out_receipt_screen_widget',{
												operation:operation,
												purpose:entered_reason,
												amount:entered_amount,
												account: account_id,
												rpc_data: rpc_data});
		},

		cash_out: function() {
			var self = this;
			var order = this.pos.get_order();
			var selectedOrder = self.pos.get('selectedOrder');
			var cashier = self.pos.cashier || self.pos.user;
			var entered_reason = $("#reason").val();
			var entered_amount = $("#amount").val();
			var session_id = self.pos.pos_session.id;
            var company_id = this.pos.company.id;
			if(entered_amount == '')
			{
				$("#error").text("Please enter amount to withdraw");
				$('#error').show();
				setTimeout(function() {$('#error').hide()},2000);
				return;
			}
			else if(entered_reason == '')
			{
				$("#error").text("Please enter reason to withdraw");
				$('#error').show();
				setTimeout(function() {$('#error').hide()},2000);
				return;
			}
			else{
			    var account_id = $('#pos_expense_list').val();
			    var account_text = $('#pos_expense_list option:selected').text();

                if (!account_id){
                    $("#error").text("Please select the account for cash out.");
                    $('#error').show();
                    setTimeout(function() {$('#error').hide()},2000);
                    return;
                }

				rpc.query({
					model: 'cash.box.out',
					method: 'create_cash_out',
					args: [cashier ? cashier.id : 0, cashier ? cashier.id : 0, entered_reason, entered_amount, session_id, account_id, company_id],

				}).then(function(cash_out) {
					if (cash_out.output){
						self.save_summary_details('Take Money Out', entered_reason,entered_amount, account_text, cash_out);
					} else {
						self.gui.show_popup('error', {
							'title': _t('No Cash Register'),
							'body': _t('There is no cash register for this PoS Session'),
						});
					}
				}).catch(function(error){
                    // error.event.preventDefault();
                    self.pos.gui.show_popup('error',{
                        'title': _t('Offline Mode'),
                        'body':  _t('Please make sure you have active internet connection.'),
                    });
                });
			}
		},
	});

	gui.define_popup({
		name: 'cash_out_popup_widget',
		widget: CashOutPopupWidget
	});
	// End Popup start

	var CashInPopupWidget = popups.extend({
		template: 'CashInPopupWidget',
		init: function(parent, args) {
			this._super(parent, args);
			this.options = {};
		},
		//
		show: function(options) {
			var self = this;
			this._super(options);
			$('#error1').hide();
		},

		renderElement: function() {
			var self = this;
			this._super();
			$('#error1').hide();
		},

		save_summary_details: function(operation, entered_reason, entered_amount, rpc_data){
			var self = this;
			this.gui.close_popup();
			self.gui.show_screen('cash_in_out_receipt_screen_widget',{
												operation:operation,
												purpose:entered_reason,
												amount:entered_amount,
												rpc_data: rpc_data});
		},

		events: {
			'click #apply_cash_in': 'cash_in',
			'click .button.cancel': 'click_cancel',
		},
		//

		cash_in: function()
		{
			var self = this;
			var order = this.pos.get_order();
			var selectedOrder = self.pos.get('selectedOrder');
			var cashier = self.pos.cashier || self.pos.user;
			var entered_reason = $("#inreason").val();
			var entered_amount = $("#cash_amount").val();
			var session_id = self.pos.pos_session.id;
            var company_id = this.pos.company.id;
			if(entered_amount == '')
			{
				$("#error").text("Please enter amount to withdraw");
				$('#error').show();
				setTimeout(function() {$('#error').hide()},2000);
				return;
			}
			else if(entered_reason == '')
			{
				$("#error").text("Please enter reason to withdraw");
				$('#error').show();
				setTimeout(function() {$('#error').hide()},2000);
				return;
			}
			else{
				rpc.query({
					model: 'cash.box.in',
					method: 'create_cash_in',
					args: [cashier ? cashier.id : 0, cashier ? cashier.id : 0, entered_reason, entered_amount, session_id, company_id],

				}).then(function(rpc_data) {
					if (rpc_data.output){
						self.save_summary_details('Put Money In', entered_reason,entered_amount, rpc_data)
					} else {
						self.gui.show_popup('error', {
							'title': _t('No Cash Register'),
							'body': _t('There is no cash register for this PoS Session'),
						});
					}
				}).catch(function(error){
                    // error.event.preventDefault();
                    self.pos.gui.show_popup('error',{
                        'title': _t('Offline Mode'),
                        'body':  _t('Please make sure you have active internet connection.'),
                    });
                });
			}
		},

	});


	gui.define_popup({
		name: 'cash_in_popup_widget',
		widget: CashInPopupWidget
	});
	// End Popup start


	var CashInOutReceiptScreenWidget = screens.ScreenWidget.extend({
		template: 'CashInOutReceiptScreenWidget',

		init: function(parent, args) {
			this._super(parent, args);
			this.options = {};  
		},
		
		show: function(options){
			var self = this;
			this._super(options);
			this.cash_render_reciept();
			if (self.should_auto_print()) {
				// window.print();
				setTimeout(function(){
					window.print();
					return;
				}, 500);
			}
		},
		
		get_cash_receipt_render_env : function() {
		    var rpc_data = this.gui.get_current_screen_param('rpc_data')
		    var tz_date = rpc_data.output ? field_utils.format.datetime(
            moment(rpc_data.create_date), {}, {timezone: true}) : false;
            var sub_sequence = rpc_data.output ? rpc_data.sub_sequence : false;
			return {
				widget: this,
				pos: this.pos,
				operation : this.gui.get_current_screen_param('operation'),
				purpose: this.gui.get_current_screen_param('purpose'),
				amount: this.gui.get_current_screen_param('amount'),
				account: this.gui.get_current_screen_param('account'),
				sub_sequence: sub_sequence,
				create_date: tz_date
			};
		},
		cash_render_reciept: function(){
			this.$('.pos-cash-receipt-container').html(QWeb.render('CashInOutReceipt', this.get_cash_receipt_render_env ()));
		},
		
		print_xml_cash_receipt: function() {
			var receipt = QWeb.render('CashInOutReceipt', this.get_cash_receipt_render_env ());
			this.pos.proxy.print_receipt(receipt);
		},
		
		print_web_cash_receipt: function() {
			window.print();
		},
		
		print_cash_receipt: function() {
			var self = this;
			if (!this.pos.config.iface_print_via_proxy) { 

				this.print_web_cash_receipt();
			} else {    
				this.print_xml_cash_receipt();
			}
		},
		
		renderElement: function() {
			var self = this;
			this._super();
			
			this.$('.next').click(function(){
				self.gui.show_screen('products');
			});
			
			this.$('.button.print-cash').click(function(){
				self.print_cash_receipt();
			}); 
		},

		should_auto_print: function() {
			return this.pos.config.iface_print_auto && !this.pos.get_order()._printed;
		},
	});
	gui.define_screen({
		name: 'cash_in_out_receipt_screen_widget',
		widget: CashInOutReceiptScreenWidget
	});
	// End CashInOutReceiptScreenWidget


	var CashInOutStatementPopupWidget = popups.extend({
		template: 'CashInOutStatementPopupWidget',
		init: function(parent, args) {
			this._super(parent, args);
			this.options = {};
		},

		events: {
			'click .button.do_print': 'print_cash_in_out_statement',
			'click .button.cancel': 'click_cancel',
		},

		//
		show: function(options) {
			var self = this;
			this._super(options);
			$('#statement_error').hide();
		},

		renderElement: function() {
			var self = this;
			this._super();
			$('#statement_error').hide();
		},

		print_cash_in_out_statement: function(){
			var self = this;
			var stmt_st_date = $('#stmt_st_date').val();
			var stmt_end_date = $('#stmt_end_date').val();
			var selected_cashier = $('#cashier').val();
			if(stmt_st_date == false){
				$('#statement_error').text('Please Enter Start Date')
				$('#statement_error').show()
				setTimeout(function() {$('#statement_error').hide()},3000);
				return;
			}
			else if(stmt_end_date == false){
				$('#statement_error').text('Please Enter End Date')
				$('#statement_error').show()
				setTimeout(function() {$('#statement_error').hide()},3000);
				return;
			}
			else{
				rpc.query({
					model: 'pos.cash.in.out',
					method: 'get_statement_data',
					args: [1, stmt_st_date, stmt_end_date,selected_cashier],
				}).then(function(output){
					self.gui.show_screen('statement_report_screen_widget',{
						statement_data:output,
						stmt_st_date:stmt_st_date,
						stmt_end_date:stmt_end_date,
						});
					});
			}
		},

	});
	gui.define_popup({
		name: 'cash_statement_popup_widget',
		widget: CashInOutStatementPopupWidget
	});

	var StatementReportScreenWidget = screens.ScreenWidget.extend({
		template: 'StatementReportScreenWidget',

		init: function(parent, args) {
			this._super(parent, args);
			this.options = {};	
		},
		
		show: function(options){
			var self = this;
			this._super(options);
			this.product_render_reciept();
			if (self.should_auto_print()) {
				// window.print();
				setTimeout(function(){
					window.print();
					return;
				}, 500);
			}
		},
		
		get_product_receipt_render_env: function() {
			return {
				widget: this,
				pos: this.pos,
				statement_data : this.gui.get_current_screen_param('statement_data'),
				stmt_st_date:  this.gui.get_current_screen_param('stmt_st_date'),
				stmt_end_date:  this.gui.get_current_screen_param('stmt_end_date'),
			};
		},
		product_render_reciept: function(){
			this.$('.pos-statement-receipt-container').html(QWeb.render('StatementSummaryReceipt', this.get_product_receipt_render_env()));
		},
		
		print_xml_product: function() {
			var receipt = QWeb.render('StatementSummaryReceipt', this.get_product_receipt_render_env());
			this.pos.proxy.print_receipt(receipt);
		},
		
		print_web_product: function() {
			window.print();
		},
		
		print_product: function() {
			var self = this;
			if (!this.pos.config.iface_print_via_proxy) { 

				this.print_web_product();
			} else {    
				this.print_xml_product();
			}
		},
		
		renderElement: function() {
			var self = this;
			this._super();
			
			this.$('.next').click(function(){
				self.gui.show_screen('products');
			});
			
			this.$('.button.print-statement').click(function(){
				self.print_product();
			});	
		},

		should_auto_print: function() {
			return this.pos.config.iface_print_auto && !this.pos.get_order()._printed;
		},
	});
	gui.define_screen({
		name: 'statement_report_screen_widget',
		widget: StatementReportScreenWidget
	});

});
