package com.financesystem.finance_api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/api/health")
    public String health() {
        return "finance-api running ok!, nothing to do at the moment";
    }
}