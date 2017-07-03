/* -------------------------------------------- 
    Note Subdivision Directive

    - builds UI for subdivision notes 
    and updates tempo in scope with active
-----------------------------------------------*/

(function (angular, $){
 
    function subdivisionNotes(){
        var $subDivision = $("#subDivisionCntr");

        return{
            restrict: "E",
            scope: {
                src: '@',
                active: '@'
            },
            template: [
                '<div class="metronome__row--1-1 metronome__row--noPad">',
                    '<a href="" class="metronome__noteLink {{::active}}">',
                        '<img src="{{::src}}" class="metronome__note">',
                    '</a>',
                '</div>'].join(""),

            link: function($scope, $element, $attr){
                
                // sets the active UI
                function setActiveNote(){
                    $subDivision
                        .find(".metronome__noteLink--active")
                        .removeClass('metronome__noteLink--active');


                    $("[division="+ $attr.division +"]", $subDivision)
                        .find(".metronome__noteLink")
                        .addClass('metronome__noteLink--active');
                }
                

                function divideNote(e){
                    setActiveNote();
                    $scope.$parent.metro.tempo($attr.division);
                    e.preventDefault();
                }

                $element.on("click", divideNote);
            }
        };
    }

    angular
        .module("metronome")
        .directive("subdivisionNotes", subdivisionNotes);

}(window.angular, window.jQuery));
