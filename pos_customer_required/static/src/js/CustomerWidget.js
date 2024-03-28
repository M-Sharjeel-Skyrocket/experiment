odoo.define('pos_customer_required.ActionpadWidgetAccessRight', function(require){
    "use strict";

    var core = require('web.core');
    var rpc = require('web.rpc');
    var _t = core._t;
    const Registries = require('point_of_sale.Registries');
    const ActionpadWidget = require('point_of_sale.ActionpadWidget');
    const { useListener } = require("@web/core/utils/hooks");
    const { useState } = owl;

    const ActionpadWidgetAccessRight = ActionpadWidget => class extends ActionpadWidget {
         setup() {
            super.setup();
            useListener('click', this.onClick);
         }

         async onClick() {
            this.showPopup('CustomerPopUpWidget', {});
        }

    }
    ActionpadWidgetAccessRight.defaultProps = {
        cancelText: _t('Cancel')
    };
    Registries.Component.extend(ActionpadWidget, ActionpadWidgetAccessRight);
    return ActionpadWidgetAccessRight;

});
