/**
 * Created by prasadm on 11/7/2017.
 */
(function ($) {
    /***
     * A sample AJAX data store implementation.
     * Right now, it's hooked up to load search results from Octopart, but can
     * easily be extended to support any JSONP-compatible backend that accepts paging parameters.
     */
    function CustomRemoteModel() {
        // private
        var PAGESIZE = 50;
        var data = {length: 0};
        var searchstr = "";
        var sortcol = null;
        var sortdir = 1;
        var h_request = null;
        var req = null; // ajax request
        var total_row_count_name = "total";
        var items_array_name = "items";
        var start_from_name="fromPage"
        var url_bulder = null;
        var request_builder = function requestData(url,fromPage,toPage){

            req = $.ajax({
                context: this,
                url: url,
                async: false,
                dataType: 'json',
                success: onSuccess,
                error: function (e) {
                    console.log("Error : " + e)
                },
                timeout: 10000
            });
            return req;
        }

        var get_total_from_data = function(data){
           return parseInt(data[total_row_count_name]);
        }
        var get_item_array_from_data = function(data){
            return data[items_array_name];
        }
        var get_start_index_from_data = function(data){
            return data[start_from_name];
        }

        // events
        var onDataLoading = new Slick.Event();
        var onDataLoaded = new Slick.Event();


        function init() {
        }


        function isDataLoaded(from, to) {
            for (var i = from; i <= to; i++) {
                if (data[i] == undefined || data[i] == null) {
                    return false;
                }
            }

            return true;
        }


        function clear() {
            for (var key in data) {
                delete data[key];
            }
            data.length = 0;
        }


        function ensureData(from, to) {
            if (req) {
                req.abort();
                for (var i = req.fromPage; i <= req.toPage; i++)
                    data[i * PAGESIZE] = undefined;
            }

            if (from < 0) {
                from = 0;
            }

            if (data.length > 0) {
                to = Math.min(to, data.length - 1);
            }

            var fromPage = Math.floor(from / PAGESIZE);
            var toPage = Math.floor(to / PAGESIZE);

            while (data[fromPage * PAGESIZE] !== undefined && fromPage < toPage)
                fromPage++;

            while (data[toPage * PAGESIZE] !== undefined && fromPage < toPage)
                toPage--;

            if (fromPage > toPage || ((fromPage == toPage) && data[fromPage * PAGESIZE] !== undefined)) {
                // TODO:  look-ahead
                onDataLoaded.notify({from: from, to: to});
                return;
            }

            var url = (url_bulder == null || url_bulder == undefined ) ? "" : url_bulder(toPage, fromPage, PAGESIZE,sortcol,(sortdir > 0));//"http://octopart.com/api/v3/parts/search?apikey=68b25f31&include[]=short_description&show[]=uid&show[]=manufacturer&show[]=mpn&show[]=brand&show[]=octopart_url&show[]=short_description&q=" + searchstr + "&start=" + (fromPage * PAGESIZE) + "&limit=" + (((toPage - fromPage) * PAGESIZE) + PAGESIZE);

            if (h_request != null) {
                clearTimeout(h_request);
            }

            h_request = setTimeout(function () {
                for (var i = fromPage; i <= toPage; i++)
                    data[i * PAGESIZE] = null; // null indicates a 'requested but not available yet'

                onDataLoading.notify({from: from, to: to});

                requestData(url,fromPage,toPage);
            }, 50);
        }


        function onError(fromPage, toPage) {
            alert("error loading pages " + fromPage + " to " + toPage);
        }

        function onSuccess(resp) {
            var items = get_item_array_from_data(resp);
            var from = get_start_index_from_data(resp), to = from + items.length;
            data.length = get_total_from_data(resp);//parseInt(resp[total_row_count_name]); // limitation of the API
             for (var i = 0; i < items.length; i++) {
                var item = items[i];

                data[from + i] = item;
                data[from + i].index = from + i;
            }

            req = null;

            onDataLoaded.notify({from: from, to: to});
        }


        function reloadData(from, to) {
            for (var i = from; i <= to; i++)
                delete data[i];

            ensureData(from, to);
        }


        function setSort(column, dir) {
            sortcol = column;
            sortdir = dir;
            clear();
        }

        function setSearch(str) {
            searchstr = str;
            clear();
        }
        function setUrlBuilder(fn){
            url_bulder = fn;
        }
        function requestData(url,fromPage,toPage){

            req = request_builder(url,fromPage,toPage);

            req.fromPage = fromPage;
            req.toPage = toPage;
        }


        function setRequestData(fn){
            request_builder = fn;
        }

        function setTotalFromData(fn){
            get_total_from_data = fn;
        }
        function setItemFromData(fn){get_item_array_from_data = fn;}
        function setStartIndexFromData(fn){get_start_index_from_data = fn;}
        init();

        return {
            // properties
            "data": data,

            // methods
            "clear": clear,
            "isDataLoaded": isDataLoaded,
            "ensureData": ensureData,
            "reloadData": reloadData,
            "setSort": setSort,
            "setSearch": setSearch,
            "setUrlBuilder":setUrlBuilder,
            "setRequestData":setRequestData,
            "onSuccess":onSuccess,
            "setTotalFromData":setTotalFromData,
            "setItemFromData":setItemFromData,
            "setStartIndexFromData":setStartIndexFromData,

            // events
            "onDataLoading": onDataLoading,
            "onDataLoaded": onDataLoaded

        };
    }

    // Slick.Data.CustomRemoteModel
    $.extend(true, window, { Slick: { Data: { CustomRemoteModel: CustomRemoteModel }}});
})(jQuery);