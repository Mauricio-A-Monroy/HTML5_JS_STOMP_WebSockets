var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var topic;
    var subscribesPoint = null;
    var subscribesPolygon = null;
    var polygon = {points : []};

    var getTopic = function(){
        return topic;
    }

    var setTopic = function(number){
        if (subscribesPoint != null){
            subscribesPoint.unsubscribe();
            subscribesPolygon.unsubscribe();
        }
        polygon = {points : []};
        topic = number;
        connectAndSubscribe();
        clearCanvas();
    }

    var clearCanvas = function(){
        const c = document.getElementById("canvas");
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.beginPath();
    };

    var initCanvas = function(){
        var c = document.getElementById("canvas");
        var ctx = c.getContext("2d");
        if(window.PointerEvent) {
            c.addEventListener("pointerdown", function(event){
                var point = getMousePosition(event);
                polygon.points.push(point);
                publishPoint(point.x, point.y);
            });
        }
        else {
            c.addEventListener("mousedown", function(event){
                var point = getMousePosition(event);
                polygon.points.push(point);
                publishPoint(point.x, point.y);
            });
        }
    };

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var addPolygonToCanvas = function (points) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = '#f00';
        console.log(points);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length ; i++){
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.closePath();
        ctx.fill();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            subscribesPoint = stompClient.subscribe('/topic/newpoint.' + topic, function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                addPointToCanvas(theObject);
            });

            subscribesPolygon = stompClient.subscribe('/topic/newpolygon.' + topic, function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                console.log(theObject);
                addPolygonToCanvas(theObject);
            });
        });

    };

    var publishPoint = function(px,py){
        var pt=new Point(px,py);
        console.info("publishing point at "+pt);
        //addPointToCanvas(pt);

        //publicar el evento
        stompClient.send("/app/newpoint." + topic, {}, JSON.stringify(pt));
    }

    return {

        init: function () {
            var can = document.getElementById("canvas");
            initCanvas();
            //websocket connection
            connectAndSubscribe();
        },

        publishPoint,
        connectAndSubscribe,
        setTopic,
        getTopic,

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();