package edu.eci.arsw.collabpaint.controller;


import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    private ConcurrentHashMap<String, ArrayList<Point>> draws = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);

        if (draws.containsKey(numdibujo)){
            draws.get(numdibujo).add(pt);
        } else {
            ArrayList<Point> arrayList = new ArrayList<>();
            arrayList.add(pt);
            draws.put(numdibujo, arrayList);
        }

        if (draws.get(numdibujo).size() < 3) {
            msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);
        } else {
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, draws.get(numdibujo));
        }

    }
}

