$(function () {
	var banks = {};
	var total = can.price;

	function fetchMoney() {
		var _self = this,
			val = this.value;
		if (banks.hasOwnProperty(val)) {
			$user_money.html(banks[val]);
			updateBankBalance();
			return;
		}
		if (!val) // uncheck "use acc"
			return disableUseAccInput();

		$user_money.html('...');
		$.get('cans.php',
		  { page: 'ajax',
			mode: 'money',
			username: val }, function (data)
		{
			banks[val] = data;
			$user_money.html(banks[_self.value] || '');
			disableUseAccInput();
		});
	}

	var $user_id = $('#user_id_jqui')
		.keyup(fetchMoney)
		.on('autocompleteselect', function (event, ui) {
			event.target.value = ui.item.value;
			fetchMoney.call(event.target);
		});

	var $use_acc = $('<div><input type="checkbox" name="use_acc">Débiter sur ce compte (si non coché, payer comptant)</div>');
	var $use_acc_input = $use_acc.find('input').change(function () {
		if (!banks[$user_id.val()]) // can't buy
			return disableUseAccInput();
		updateBankBalance();
	});
	function disableUseAccInput() {
		$use_acc_input.removeAttr('checked');
	}

	var $user_money = $('<span>')
		.insertAfter($user_id);
	$('<span>&euro;</span>').insertAfter($user_money)
		.after($use_acc);

	var $input_number = $('[name=count]');
	var $total_price = $('<span>').html('Prix total : ' + can.price + ' &euro;')
		.insertAfter($input_number);
	$input_number.on('change keyup keydown paste', function() {
    	var val = $input_number.val();
    	if (/[^0-9]/.test(val))
    		$input_number.val(val = val.replace(/[^0-9]/g, ''));
		total = Math.round((val * can.price) * 100) / 100;
    	$total_price.html('Prix total : ' + total + ' &euro;');
    	updateBankBalance();
	});

	function updateBankBalance() {
		//check the clien bank
		var money = banks[$user_id.val()];
		if (!money || !$use_acc_input.is(':checked'))
			return $user_money.html(money ? money : "");
	
		var rest = Math.round((money - total) * 100) / 100;
		$user_money.html(money + " - " + total + " = \
			<span " + color_for(rest) + "> " + rest + " </span>");
		$("input[name=save]").prop("disabled", rest < 0);	
	}
});

function color_for(rest) {
	return "style='color: " + (rest < 0 ? 'red' : 'green') + "'";
}
