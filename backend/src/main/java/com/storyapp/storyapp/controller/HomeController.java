package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.dto.response.HomePageResponse;
import com.storyapp.storyapp.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/homepage")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping
    public HomePageResponse getHomePageData() {
        return homeService.getHomePageData();
    }
}
