package com.storyapp.storyapp.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseVersionInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        String[] tables = {
            "users",
            "authors",
            "genres",
            "stories",
            "chapters",
            "vip_packages",
            "coin_orders",
            "password_reset_otps",
            "reading_progress"
        };

        for (String table : tables) {
            try {
                int updated = jdbcTemplate.update("UPDATE " + table + " SET version = 0 WHERE version IS NULL");
                if (updated > 0) {
                    log.info("Initialized {} rows with version = 0 for table '{}'", updated, table);
                }
            } catch (Exception e) {
                // Table or column might not exist yet, ignore safely
                log.debug("Version update skipped for table '{}': {}", table, e.getMessage());
            }
        }

        // Backfill null external_id for stories
        try {
            int backfilled = jdbcTemplate.update("UPDATE stories SET external_id = CONCAT('STORY-', LPAD(id, 6, '0')) WHERE external_id IS NULL OR external_id = ''");
            if (backfilled > 0) {
                log.info("Backfilled external_id for {} existing stories", backfilled);
            }
        } catch (Exception e) {
            log.debug("External ID backfill skipped: {}", e.getMessage());
        }
    }
}
