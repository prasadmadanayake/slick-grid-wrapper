/**
 * Created by prasadm on 11/13/2017.
 */

function GridComponentJS(){
    this.Grid = null;
    this.Loader = null;
}

GridComponentJS.prototype = {
    constructor: GridComponentJS,
    initialize:function(grid_element,columns,options,get_document_root_fn,get_stylesheets_fn){
        this.Loader = new Slick.Data.CustomRemoteModel();
        this.Grid = new Slick.Grid(grid_element, this.Loader.data, columns, options,get_document_root_fn,get_stylesheets_fn);
        this.Grid.setSelectionModel(new Slick.RowSelectionModel());

        this.Grid.onViewportChanged.subscribe(function (e, args) {
            var vp = this.Grid.getViewport();
            this.Loader.ensureData(vp.top, vp.bottom);
        }.bind(this));
        this.Grid.onSort.subscribe(function (e, args) {
            this.Loader.setSort(args.sortCol.field, args.sortAsc ? 1 : -1);
            var vp = this.Grid.getViewport();
            this.Loader.ensureData(vp.top, vp.bottom);
        }.bind(this));
        this.Loader.onDataLoaded.subscribe(function (e, args) {
            for (var i = args.from; i <= args.to; i++) {
                this.Grid.invalidateRow(i);
            }
            this.Grid.updateRowCount();
            this.Grid.render();
        }.bind(this));
    },
    //func = function(){}
    onSelectionChanged:function(func){this.Grid.onSelectedRangesChanged.subscribe(func);},

    getGrid:function(){return this.Grid;},
    getLoader:function(){return this.Loader;},

    //func = function(fromindex,toIndex,sort-cols,asc)
    setUrlBuilder:function(func){
        this.Loader.setUrlBuilder(function(to, from, pagesize, sortcols, asc){
            func((from * pagesize), (((to - from) * pagesize) + pagesize), sortcols, asc);
        }.bind(func))
    },
    //for view port data
    onViewPortData(result){
        this.Loader.onSuccess(result);
    },
    //func = function(url)
    setSendDataRequestFunction:function(func){
        this.Loader.setRequestData(function(url,fromPage,toPage){
            func(url);
        }.bind(func))
    },
    returnTotalFromData:function(fn){this.Loader.setTotalFromData(fn);},
    returnItemArrayFromData:function(fn){this.Loader.setItemFromData(fn);},
    returnStartIndexFromData:function(fn){this.Loader.setStartIndexFromData(fn);},
    setColumns:function(columns){this.Grid.setColumns(columns);},
    scrollRowIntoView:function(rowIndex,toTop){
        this.Grid.scrollRowIntoView(rowIndex,toTop==undefined ?false:toTop);
    },
    selectRow:function(rowIndex,scrollToTop){
        this.Grid.scrollRowIntoView(rowIndex,scrollToTop==undefined ?false:scrollToTop);
        this.Grid.setSelectedRows([rowIndex]);
    },
    selectRowsByInedx:function(index_arr){
        this.Grid.setSelectedRows(index_arr);
    },
    sort:function(colName,asc){
        this.Loader.setSortColumn(colName,asc);
    },
    //fn = function(row,cell,x,y)
    onContextMenu:function(fn){
        this.Grid.onContextMenu.subscribe(function(e){
            e.preventDefault();
            var cell =  this.Grid.getCellFromEvent(e);
            fn(cell.row,cell.cell,e.pageX,e.pageY,e.target);
        }.bind(this));
    }

}