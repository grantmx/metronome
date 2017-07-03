/* -------------------------------- 
    Pitch Control Directive
    
    - handles the UI state of 
    the pitch control dots
----------------------------------*/

(function (angular, $){

    function pitchControl(){
        return{
            restrict: "E",
            scope: {
                id: "@",
                state: "@"
            },
            template: [
                '<input type="checkbox" class="metronome__pitchControlCheckbox" name="pitchControl{{::id}}" id="pitchControl_{{::id}}"/>',
                '<label for="pitchControl_{{::id}}" class="metronome__pitchControl"></label>'].join(""),

            link: function($scope, $element, $attr){

                // changes the state property of the pitch control when one is clicked
                function pitchControlState(event){
                    var item = $scope.$parent.items;

                    switch(item.state){
                        case "active":
                            item.state = "accented";
                            break;
                        case "accented":
                            item.state = "disabled";
                            toggleDisabledActive({ e: event, disabled: true, checked: true });
                            break;
                        case "disabled":
                            item.state = "active";
                            toggleDisabledActive({ e: event, disabled: false, checked: false });
                            break;
                    }

                }


                // makes the disabled UI ~ gray
                // makes the UI active ~ white
                // accented state is handled through the CSS in the checked state ~ red
                function toggleDisabledActive(args){
                     $(args.e.target)
                        .siblings('label').toggleClass("metronome__pitchControl--disabled", args.disabled)
                            .end()
                        .prop("checked", args.checked);
                }


                // one time for UI only
                if($attr.state === "accented"){
                    $element.find("input").prop("checked", true);
                }


                $element
                    .on("change", pitchControlState);

            }
        };
    }


    angular
        .module("metronome")
        .directive("pitchControl", pitchControl);

}(window.angular, window.jQuery));
