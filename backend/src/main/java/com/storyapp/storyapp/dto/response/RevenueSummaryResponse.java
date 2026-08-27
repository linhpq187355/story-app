package com.storyapp.storyapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueSummaryResponse {
    private long today;
    private long last7Days;
    private long last30Days;
    private long total;
}
