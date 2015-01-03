
$(function() {

	// navigation effect
	$home = $("#btnHome");
	$installation = $("#btnInstallation");

	function resetClasses() {
		$home.removeClass('active');
		$installation.removeClass('active');
	}

	// Event handlers
	$home.children().on('click', function(){
		resetClasses();
		$home.addClass('active');
	});

	$installation.children().on('click', function(){
		resetClasses();
		$installation.addClass('active');
	});

	$("#logo").children().children().on('click', function() {		
		resetClasses();
		$home.addClass('active');
	});

  // CSS Tricks Smooth Scrolling
  $('a[href*=#]:not([href=#])').click(function() {
   	 var target = $(this.hash);
     target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
     if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 350);
        return false;
      }
  });  
});
