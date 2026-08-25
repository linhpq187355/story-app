package com.storyapp.storyapp.entity;

import com.storyapp.storyapp.entity.base.BaseEntity;
import com.storyapp.storyapp.enums.VoiceGender;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "chapter_audios", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"chapter_id", "voice_gender"})
})
public class ChapterAudio extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @Enumerated(EnumType.STRING)
    @Column(name = "voice_gender", nullable = false, length = 20)
    private VoiceGender voiceGender = VoiceGender.FEMALE;

    @Column(name = "voice_name", length = 100)
    private String voiceName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    private Integer duration;
}
