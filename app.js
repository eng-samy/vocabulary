$(document).ready(function() {
    load_vocabs();
});

const loader = '<div class="loader"><div></div><div></div><div></div><div></div> <span>Loading</span></div>';

const endpoint = "http://vocabulary.samy.engineer/api/index.php/";

const req_num_row = 20;

let answers;

let vocabs = [];

const challenge_count = 20;

let curr_vocab;

function load_vocabs() {
    $('#app').html(loader);
    $('#pageTitle').hide();
    $('#percentage').hide();
    $('#actions').hide();
    $('#backHome').hide();
    $.ajax({
        url: endpoint + "vocabulary"
    }).done(function(data) {
        render_vocabs(JSON.parse(data));
        delete_handler();
        pagination();
        search_in_table();
    });
}

function render_vocabs(data) {

    var table_data = "";
    $.each(data, function(key, value) {
        table_data += "<tr id='vocab_" + value.id + "'><td>" + value.native_word + "</td><td>" + value.translated_word + "</td><td><button class='btn btn-danger btn-sm font-weight-bold delete_item'><i class='fa fa-trash'><i></button></td></tr>";
    });

    $('#vocabs table tbody').html(table_data);
    $('#pageTitle').html('<i class="fa fa-list"></i> Vocabulary List');
    $('#app').html($('#vocabs').html());
    $('#startTest').html('<i class="fa fa-play"></i> Start Test ');
    $('#newItem').show();
    $('#pageTitle').show();
    $('#actions').show();
}

$("#newItem").on('click', function() {

    if ($("#newVocab").length == 0) {
        var add_form = "<tr class='shake' id='newVocab'><td><input type='text' placeholder='English Vocabulary' class='form-control' id='englishValue'></td><td><input type='text' class='form-control' placeholder='German Vocabulary' id='germanValue'></td><td id='addOperation'><button class='btn btn-new' id='addBtn'><i class='fa fa-save'></i> Save</button> <button class='btn btn-light' id='skipBtn'>Skip</button></</td></tr>";
        $('#app table tbody').prepend(add_form);
        $('#englishValue').focus();
        $('#newItem').fadeOut();
        add_handler();
    } else {
        var el = $('#newVocab'),
            newone = el.clone(true);
        el.before(newone);
        $("." + el.attr("class") + ":last").remove();
    }
});

function add_handler(){
    $("#addBtn").on('click', function() {
        var englishValue = $('#englishValue').val();
        var germanValue = $('#germanValue').val();

        if (require_field($('#englishValue')) && require_field($('#germanValue'))) {
            $(this).attr("disabled", true);
            $(this).html('<i class="fa fa-spinner fa-spin"></i> Saving');
            $.post(endpoint + "vocabulary/add", {
                englishValue: englishValue,
                germanValue: germanValue
            }).done(function(response) {
                data = JSON.parse(response);
                console.log(data);
                if (data.status == 200) {
                    $("#newVocab").remove();
                    var new_row = "<tr id='vocab_" + data.item_id + "' class='new_item'><td>" + englishValue + "</td><td>" + germanValue + "</td><td><button class='btn btn-danger btn-sm delete_item font-weight-bold'><i class='fa fa-trash'><i></button></td></tr>";
                    $('#app table tbody').prepend(new_row);
                    $('#newItem').fadeIn();

                    $new_item_tr = $('#vocab_' + data.item_id);
                    $new_item_tr.css("background-color", "#c2e2c0");
                    setTimeout(function() {
                        $new_item_tr.css("background-color", "");
                    }, 400);

                    pagination('add');
                } else {
                    alert(data.message);
                }
            });
        }
    });

    $("#skipBtn").on('click', function() {
        $("#newVocab").hide('fast', function() {
            $("#newVocab").remove();
        });
        $('#newItem').fadeIn();
    });
}

function delete_handler() {
    $("#app table tbody").on('click', '.delete_item', function() {
        var closest_tr = this.closest('tr').id
        item_id = closest_tr.split('_')[1];
        $(this).attr("disabled", true);
        $(this).html('<i class="fa fa-spinner fa-spin"></i> Removing');
        $.post({
            url: endpoint + 'vocabulary/delete',
            data: {
                item_id,
                item_id
            },
            success: function(result) {
                $('#' + closest_tr).remove();
                pagination();
            }
        });
    });
}

function pagination(oper = 'update') {
    var $tr = $('#app table tbody tr');
    var total_num_row = $tr.length;
    var num_pages = 0;
    var active_page = $('#pagination li.active').text();
    if (total_num_row != 0) {
        $('.noData').remove();
        if (total_num_row % req_num_row == 0) {
            num_pages = total_num_row / req_num_row;
        }
        if (total_num_row % req_num_row >= 1) {
            num_pages = total_num_row / req_num_row;
            num_pages++;
            num_pages = Math.floor(num_pages++);
        }
        var pager_content = '';
        if (total_num_row > req_num_row) {
            for (var i = 1; i <= num_pages; i++) {
                pager_content += '<li class="page-item" id="page_' + i + '"><a class="page-link" href="#">' + i + "</a></li>";
            }
        } else {
            active_page = 1;
        }

        $('#pagination').html(pager_content);

        $tr.each(function(i) {
            $(this).hide();
            if (i + 1 <= req_num_row) {
                $tr.eq(i).show();
            }
        });

        $('#pagination li').removeClass('active');
        if (active_page.length == 0 || oper == 'add') {
            $('#pagination li').first().addClass('active');
            active_page = 1;
        } else {
            $('#pagination #page_' + active_page).addClass('active');

        }
        redraw(active_page);
    } else {
        $('#app table tbody').html("<h6 class='noData'> No Data Available</h6>");
    }

    $('#pagination a').click(function(e) {
        e.preventDefault();
        var page = $(this).text();
        $('#pagination li').removeClass('active');
        $(this).closest('li').addClass('active');
        redraw(page);

    });
}

function search_in_table() {
    $("#searchBox").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#app table tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
}

function redraw(page) {
    var $tr = $('#app table tbody tr');

    if ($tr.length < req_num_row) {
        display_count = $tr.length;
        from_page = 1;
        to_page = display_count
    } else {
        display_count = req_num_row;
        from_page = ((page - 1) * display_count) + 1
        if (display_count * page > $tr.length) {
            to_page = $tr.length;
        } else {
            to_page = display_count * page;
        }
    }

    $('#pages').html('Showing ' + from_page + ' to ' + to_page + ' of ' + $tr.length + ' entries');

    $tr.hide();

    var temp = page - 1;
    var start = temp * req_num_row;

    for (var i = 0; i < req_num_row; i++) {

        $tr.eq(start + i).show();

    }
}

$("#startTest").on('click', function() {
    load_test();
});

function load_test() {
    $('#app').html(loader);
    $('#actions').hide();
    $('#percentage').hide();
    $.ajax({
        url: endpoint + "vocabulary/get_random_vocabs"
    }).done(function(data) {
        $('#pageTitle').html('<i class="fa fa-tasks"></i> Test Mode ');
        $('#pageTitle').show(300);
        $('#app').html($('#test').html());
        $('#progress-header').html("Step 1 from " + challenge_count);
        vocabs = JSON.parse(data);
        answers = [];
        challenge_vocab();
    });
}

function challenge_vocab() {
    if (vocabs.length === 0) {
        $('#vocab_content').html('<button class="btn btn-success mb-3 font-weight-bold" id="showResults"> <i class="fa fa-signal"></i> Show Results</button>');
        $('#progress-bar').css('background-color', "#59c972");
        $('#app .card .card-text').html("You have successfully completed the test, Click to below button to show results");
    } else {
        curr_vocab = vocabs.shift();
        new_step = '<div class="form-group mb-3 col-md-3"><label class="sr-only">English</label><input type="text" readonly class="form-control-plaintext font-weight-bold text-center" id="fromLang" value="“' + curr_vocab.native_word + '”"></div><div class="form-group mx-sm-3 mb-3 col-md-4"><label class="sr-only">German</label> <input type="text" class="form-control" placeholder="In German" id="answerValue"></div><button type="submit" class="btn btn-new mb-3" id="submitAnswer">Submit</button></div></div>';

        $('#vocab_content').html(new_step);
        $('#answerValue').focus();

    }
}

$("#app").on('click', '#submitAnswer', function() {
    if (require_field($("#answerValue"))) {
        submit_answer();
    }
});

function submit_answer() {
    var answer = $('#answerValue').val();
    curr_vocab.answer = answer;
    answers.push(curr_vocab);
    var progress = (answers.length * 100) / challenge_count;
    $('#progress-bar').css('width', progress + "%");
    $('#progress-bar').html(progress + "%");
    if (answers.length != challenge_count) {
        $('#progress-header').html("Step " + (answers.length + 1) + " from " + challenge_count);
    } else {
        $('#progress-header').html('Test Completed!');
    }
    challenge_vocab();
}

$("#app").on('click', '#showResults', function() {
    get_results();
});

function get_results() {
    $('#app').html(loader);
    $.post(endpoint + "vocabulary/submit_results", {
        answers: JSON.stringify(answers)
    }).done(function(response) {
        data = JSON.parse(response);
        show_results(data);
    });
}

function show_results(data) {
    var table_data = "";
    $.each(data.results, function(key, value) {
        if (value.result == 0) {
            var indictor = "<span class='result-indictor font-weight-bold wrong-answer'><i class='fa fa-times'></i> Wrong Answer</span>";
        } else {
            var indictor = "<span class='result-indictor font-weight-bold correct-answer'><i class='fa fa-check'></i> Correct Answer</span>";
        }
        table_data += "<tr><td>" + value.native_word + "</td><td>" + value.translated_word + "</td><td>" + value.answer + "</td><td>" + indictor + "</td></tr>";
    });

    $('#results table tbody').html(table_data);
    $('#hitsParcentage').html(data.hits+"%");
    $('#missesParcentage').html(data.misses+"%");

    $('#pageTitle').html('<i class="fa fa-signal"></i> Test Results');
    $('#backHome').show();
    $('#newItem').hide();
    $('#startTest').html('<i class="fa fa-play"></i> Retry');
    $('#actions').show();
    $('#percentage').show();
    $('#app').html($('#results').html());
}

$("#backHome").on('click', function() {
    load_vocabs();
});

function require_field(input) {
    var input_val = input.val();
    if (input_val.length === 0) {
        input.addClass('form_error');
        input.addClass('shake');
        input.focus();
        return false;
    }
    return true;
}

$("#app").on('keyup', '.form-control', function() {
    $(this).removeClass('shake');
    $(this).removeClass('form_error');
});