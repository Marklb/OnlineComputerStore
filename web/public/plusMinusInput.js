// plugin bootstrap minus and plus
// http://jsfiddle.net/laelitenetwork/puJ6G/
// Modified by: Marklb
function pmCheckMinMaxInput(pElem){
    minValue =  parseInt(pElem.attr('min'));
    maxValue =  parseInt(pElem.attr('max'));
    valueCurrent = parseInt(pElem.val());

    name = pElem.attr('data-name');
    if(valueCurrent >= minValue) {
        $(".btn-pm-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        // alert('Sorry, the minimum value was reached');
        pElem.val(pElem.data('oldValue'));
    }
    if(valueCurrent <= maxValue) {
        $(".btn-pm-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        // alert('Sorry, the maximum value was reached');
        pElem.val(pElem.data('oldValue'));
    }
};
$('.btn-pm-number').click(function(e){
    e.preventDefault();

    fieldName = $(this).attr('data-field');
    type      = $(this).attr('data-type');
    var input = $("input[data-name='"+fieldName+"']");
    var currentVal = parseInt(input.val());
    if (!isNaN(currentVal)) {
        if(type == 'minus') {

            if(currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
            }
            if(parseInt(input.val()) == input.attr('min')) {
                $(this).attr('disabled', true);
            }

        } else if(type == 'plus') {

            if(currentVal < input.attr('max')) {
                input.val(currentVal + 1).change();
            }
            if(parseInt(input.val()) == input.attr('max')) {
                $(this).attr('disabled', true);
            }

        }
    } else {
        input.val(0);
    }
});
$('.input-pm-number').focusin(function(){
   $(this).data('oldValue', $(this).val());
});
$('.input-pm-number').change(function() {
    pmCheckMinMaxInput($(this));
});
$(".input-pm-number").keydown(function (e) {
    // Disable submitting on Enter
    if (e.keyCode == 13) {
        pmCheckMinMaxInput($(this));
        e.preventDefault();
        return;
    }
    // Allow: backspace, delete, tab, escape, enter and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
         // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
         // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
             // let it happen, don't do anything
             return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
});
