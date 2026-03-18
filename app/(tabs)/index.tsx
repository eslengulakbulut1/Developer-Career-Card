import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

// --- Enable LayoutAnimation for Android ---
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Types ---
type Badge = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string; // Eklendi: Rozetin açıklama / kazanma şartı
};

type LevelDefinition = {
  title: string;
  minXp: number;
  maxXp: number | null;
  color: string;
};

type ProjectType = {
  id: string;
  title: string;
  difficulty: "Kolay" | "Orta" | "Zor" | "Epik";
  baseXp: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isSpecialty: boolean; // Uzmanlık alanına uygunsa true
};

type SummaryData = {
  projectName: string;
  earnedXp: number;
  bonusXp: number;
  unlockedBadges: Badge[];
};

// --- Constants ---
const LEVELS: LevelDefinition[] = [
  { title: "Junior", minXp: 0, maxXp: 150, color: "#4CAF50" },
  { title: "Mid", minXp: 150, maxXp: 400, color: "#2196F3" },
  { title: "Senior", minXp: 400, maxXp: 1000, color: "#9C27B0" },
  { title: "Lead", minXp: 1000, maxXp: null, color: "#FF9800" },
];

const AVAILABLE_BADGES: Badge[] = [
  { id: "first_project", name: "İlk Kan", icon: "rocket", color: "#FF5722", description: "İlk projenizi başarıyla tamamladığınızda kazanılır." },
  { id: "epic_finisher", name: "Epik Teslimat", icon: "star", color: "#E91E63", description: "Zorluk seviyesi 'Epik' olan zorlu bir projeyi teslim ettiğinizde verilir." },
  { id: "hard_worker", name: "Çalışkan", icon: "briefcase", color: "#795548", description: "Kariyeriniz boyunca toplam 5 projeyi başarıyla bitirdiğinizde kazanılır." },
  { id: "bug_hunter", name: "Bug Avcısı", icon: "bug", color: "#00BCD4", description: "Deneyim puanınız 200 XP'ye ulaştığında açılan yetenek rozetidir." },
  { id: "master", name: "Usta Geliştirici", icon: "trophy", color: "#FFC107", description: "Deneyim puanınız 500 XP'ye ulaştığında verilen prestij rozetidir." },
];

const PROJECTS: ProjectType[] = [
  {
    id: "p1",
    title: "Mobil Uygulama",
    difficulty: "Zor",
    baseXp: 100,
    icon: "phone-portrait-outline",
    color: "#3B82F6",
    isSpecialty: true, // React Native Developer uzmanlığına uygun
  },
  {
    id: "p2",
    title: "Dashboard Paneli",
    difficulty: "Orta",
    baseXp: 60,
    icon: "desktop-outline",
    color: "#8B5CF6",
    isSpecialty: false,
  },
  {
    id: "p3",
    title: "Bug Fix Sprinti",
    difficulty: "Kolay",
    baseXp: 30,
    icon: "bug-outline",
    color: "#EF4444",
    isSpecialty: false,
  },
  {
    id: "p4",
    title: "AI Chat App",
    difficulty: "Epik",
    baseXp: 200,
    icon: "chatbubbles-outline",
    color: "#10B981",
    isSpecialty: false,
  },
];

// --- Custom Animated Button Component ---
const AnimatedButton = ({
  onPress,
  disabled,
  style,
  children,
}: {
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  children: React.ReactNode;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 15,
      bounciness: 10,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, disabled && { opacity: 0.6 }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

// --- Animated Badge Component ---
const AnimatedBadgeCard = ({
  badge,
  index,
  isUnlocked,
  isNew,
  onPress,
}: {
  badge: Badge;
  index: number;
  isUnlocked: boolean;
  isNew: boolean;
  onPress: () => void;
}) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: isUnlocked ? 1 : 0.5,
        duration: 400,
        delay: index * 50, // Faster stagger
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    if (isNew) {
      Animated.sequence([
        Animated.delay(400 + index * 50),
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [opacityAnim, translateYAnim, scaleAnim, index, isUnlocked, isNew]);

  const color = isUnlocked ? badge.color : "#94A3B8"; // Slate for locked
  const bgColor = isUnlocked ? `${badge.color}10` : "#F8FAFC";

  return (
    <Animated.View
      style={[
        { opacity: opacityAnim, transform: [{ translateY: translateYAnim }, { scale: scaleAnim }], width: "31%", minWidth: 105, marginBottom: 12 },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={[styles.badgeCard, { borderColor: color, backgroundColor: bgColor, width: "100%", marginRight: 0 }]}
      >
        <Ionicons name={badge.icon} size={32} color={color} />
        <Text style={[styles.badgeText, { color: isUnlocked ? "#1E293B" : "#64748B" }]} numberOfLines={2}>
          {badge.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
};


// --- Main Screen ---
export default function DeveloperCardScreen() {
  const [xp, setXp] = useState(0);
  const [displayXp, setDisplayXp] = useState(0); // For soft number increment

  const [isWorking, setIsWorking] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectType | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);

  const [badges, setBadges] = useState<Badge[]>([]);
  const [recentBadges, setRecentBadges] = useState<string[]>([]);
  const [completedProjectsCount, setCompletedProjectsCount] = useState(0);

  // Badge Modal State
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Summary Modal State
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  // Summary Animations
  const summaryOpacityAnim = useRef(new Animated.Value(0)).current;
  const summaryTranslateYAnim = useRef(new Animated.Value(50)).current;

  // Scroll Ref
  const scrollViewRef = useRef<ScrollView>(null);
  const [workspaceY, setWorkspaceY] = useState(0);

  // Animations
  const xpScaleAnim = useRef(new Animated.Value(1)).current;
  const levelProgressAnim = useRef(new Animated.Value(0)).current;
  const taskProgressAnim = useRef(new Animated.Value(0)).current;

  // Derive Level
  const currentLevelIndex = LEVELS.findIndex(
    (lvl) => xp >= lvl.minXp && (lvl.maxXp === null || xp < lvl.maxXp)
  );
  const currentLevel = LEVELS[currentLevelIndex] || LEVELS[0];
  const nextLevel = LEVELS[currentLevelIndex + 1];
  const levelProgress = nextLevel
    ? (xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)
    : 1;

  // Soft XP Number Counter
  useEffect(() => {
    if (displayXp !== xp) {
      const step = Math.max(1, Math.ceil(Math.abs(xp - displayXp) / 10));
      const interval = setInterval(() => {
        setDisplayXp((prev) => {
          if (prev < xp) {
            const next = prev + step;
            return next >= xp ? xp : next;
          }
          return xp; // fallback
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [xp, displayXp]);

  // Animate Level Progress Bar
  useEffect(() => {
    Animated.timing(levelProgressAnim, {
      toValue: levelProgress,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [levelProgress, levelProgressAnim]);

  // Animate Task Progress Bar
  useEffect(() => {
    Animated.timing(taskProgressAnim, {
      toValue: progressPercent / 100,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progressPercent, taskProgressAnim]);

  // Actions
  const handleAssignProject = () => {
    if (!selectedProject) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveProject(selectedProject);
    setIsWorking(true);
    setProgressPercent(0);
  };

  const handleAdvanceProgress = () => {
    if (progressPercent < 100) {
      setProgressPercent((prev) => Math.min(prev + 25, 100)); // Increase by 25%
    }
  };

  const handleDeliverProject = () => {
    if (!activeProject) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // XP Calculation
    let earnedXp = activeProject.baseXp;
    let bonusXp = 0;
    if (activeProject.isSpecialty) {
      bonusXp = Math.floor(earnedXp * 0.3); // 30% bonus for specialty
    }
    const totalXp = earnedXp + bonusXp;

    const newXp = xp + totalXp;
    const newCompletedCount = completedProjectsCount + 1;

    // Badge Logic
    const newBadges = [...badges];
    const unlockedNow: Badge[] = [];

    if (newCompletedCount === 1 && !newBadges.find((b) => b.id === "first_project")) {
      newBadges.push(AVAILABLE_BADGES[0]);
      unlockedNow.push(AVAILABLE_BADGES[0]);
    }
    if (activeProject.difficulty === "Epik" && !newBadges.find((b) => b.id === "epic_finisher")) {
      newBadges.push(AVAILABLE_BADGES[1]);
      unlockedNow.push(AVAILABLE_BADGES[1]);
    }
    if (newCompletedCount >= 5 && !newBadges.find((b) => b.id === "hard_worker")) {
      newBadges.push(AVAILABLE_BADGES[2]);
      unlockedNow.push(AVAILABLE_BADGES[2]);
    }
    if (newBadges.filter(b => b.id !== "first_project" && b.id !== "epic_finisher" && b.id !== "hard_worker").length === 0) {
      // Just some conditions
      if (newXp >= 200 && !newBadges.find((b) => b.id === "bug_hunter")) {
        newBadges.push(AVAILABLE_BADGES[3]);
        unlockedNow.push(AVAILABLE_BADGES[3]);
      }
      if (newXp >= 500 && !newBadges.find((b) => b.id === "master")) {
        newBadges.push(AVAILABLE_BADGES[4]);
        unlockedNow.push(AVAILABLE_BADGES[4]);
      }
    }

    if (newBadges.length > badges.length) {
      setBadges(newBadges);
      setRecentBadges(unlockedNow.map((b) => b.id));
    } else {
      setRecentBadges([]); // clear if no new badges
    }

    // Set Summary Data before resetting states
    setSummaryData({
      projectName: activeProject.title,
      earnedXp: earnedXp,
      bonusXp: bonusXp,
      unlockedBadges: unlockedNow,
    });

    // Update States
    setXp(newXp);
    setCompletedProjectsCount(newCompletedCount);
    setIsWorking(false);
    setActiveProject(null);
    setSelectedProject(null); // Reset selection
    setProgressPercent(0);

    // Scroll back to workspace section top
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: workspaceY, animated: true });
    }

    // Animate Summary Modal
    summaryOpacityAnim.setValue(0);
    summaryTranslateYAnim.setValue(50);
    Animated.parallel([
      Animated.timing(summaryOpacityAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(summaryTranslateYAnim, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.back(1.5)) })
    ]).start();

    // Animate XP text bump
    Animated.sequence([
      Animated.timing(xpScaleAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(xpScaleAnim, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();
  };

  // Derived UI
  const statusColor = isWorking ? "#F59E0B" : "#10B981"; // Amber : Emerald
  const statusText = isWorking ? "Projelerde Çalışıyor" : "Müsait, Proje Bekliyor";
  const statusIcon = isWorking ? "code-working-outline" : "checkmark-circle-outline";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* Profile Header Card */}
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.name}>Eslen Gül Akbulut</Text>
              <Text style={styles.specialty}>React Native Developer</Text>
            </View>
          </View>

          {/* Special Status Indicator */}
          <View style={[styles.statusBox, { backgroundColor: `${statusColor}15`, borderColor: `${statusColor}40` }]}>
            <Ionicons name={statusIcon} size={22} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>

          {/* Level & XP Section */}
          <View style={styles.xpSection}>
            <View style={styles.levelRow}>
              <View style={[styles.levelBadge, { backgroundColor: currentLevel.color }]}>
                <Text style={styles.levelBadgeText}>{currentLevel.title}</Text>
              </View>
              <Animated.Text style={[styles.xpText, { transform: [{ scale: xpScaleAnim }] }]}>
                {displayXp} XP
              </Animated.Text>
            </View>

            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: levelProgressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                    backgroundColor: currentLevel.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.xpHint}>
              {nextLevel ? `Sonraki seviyeye ${nextLevel.minXp - displayXp} XP kaldı` : "Maksimum seviyedesin!"}
            </Text>
          </View>
        </View>

        {/* Dynamic Workspace Area */}
        <View
          style={[styles.card, styles.workspaceCard]}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setWorkspaceY(layout.y);
          }}
        >
          {!isWorking ? (
            // --- SELECT & ASSIGN PROJECT ---
            <View>
              <Text style={styles.sectionTitle}>Yeni Proje Ata</Text>
              <Text style={styles.sectionSubtitle}>Geliştiriciye uygun bir görev seçin.</Text>

              <View style={styles.projectList}>
                {PROJECTS.map((proj) => {
                  const isSelected = selectedProject?.id === proj.id;
                  return (
                    <Pressable
                      key={proj.id}
                      style={[
                        styles.projectOption,
                        isSelected && [styles.projectOptionSelected, { borderColor: proj.color }]
                      ]}
                      onPress={() => setSelectedProject(proj)}
                    >
                      <View style={[styles.projectIconBox, { backgroundColor: `${proj.color}20` }]}>
                        <Ionicons name={proj.icon} size={24} color={proj.color} />
                      </View>
                      <View style={styles.projectDetails}>
                        <Text style={styles.projectTitle}>{proj.title}</Text>
                        <View style={styles.projectMetaRow}>
                          <Text style={styles.projectDifficulty}>{proj.difficulty}</Text>
                          <Text style={styles.projectMetaDot}> • </Text>
                          <Text style={styles.projectXpLabel}>{proj.baseXp} XP</Text>
                          {proj.isSpecialty && <Text style={styles.bonusBadge}>+Bonus</Text>}
                        </View>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={24} color={proj.color} />}
                    </Pressable>
                  );
                })}
              </View>

              <AnimatedButton
                onPress={handleAssignProject}
                disabled={!selectedProject}
                style={[styles.actionButton, !selectedProject ? styles.actionButtonDisabled : { backgroundColor: "#3B82F6" }]}
              >
                <Text style={styles.actionButtonText}>Projeyi Ata</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </AnimatedButton>
            </View>
          ) : (
            // --- ACTIVE PROJECT WORKFLOW ---
            <View>
              <View style={styles.activeProjectHeader}>
                <View style={[styles.projectIconBox, { backgroundColor: `${activeProject?.color}20`, padding: 12 }]}>
                  <Ionicons name={activeProject?.icon!} size={32} color={activeProject?.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.activeProjectLabel}>Devam Eden Proje</Text>
                  <Text style={styles.activeProjectTitle}>{activeProject?.title}</Text>
                  <Text style={styles.activeProjectReward}>Ödül: {activeProject?.baseXp} XP {activeProject?.isSpecialty && "(+ Uzmanlık Bonusu)"}</Text>
                </View>
              </View>

              <View style={styles.taskProgressSection}>
                <View style={styles.taskProgressHeader}>
                  <Text style={styles.taskProgressLabel}>İlerleme Durumu</Text>
                  <Text style={styles.taskProgressPercent}>%{progressPercent}</Text>
                </View>
                <View style={styles.taskProgressBarContainer}>
                  <Animated.View
                    style={[
                      styles.taskProgressBarFill,
                      {
                        width: taskProgressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }),
                        backgroundColor: activeProject?.color,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.workflowActions}>
                {progressPercent < 100 ? (
                  <AnimatedButton
                    onPress={handleAdvanceProgress}
                    style={[styles.actionButton, { backgroundColor: "#6366F1", flex: 1 }]}
                  >
                    <Ionicons name="flash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.actionButtonText}>İlerlet (+%25)</Text>
                  </AnimatedButton>
                ) : (
                  <AnimatedButton
                    onPress={handleDeliverProject}
                    style={[styles.actionButton, { backgroundColor: "#10B981", flex: 1 }]}
                  >
                    <Ionicons name="checkmark-done-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.actionButtonText}>Teslim Et & Ödülü Al</Text>
                  </AnimatedButton>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Badges Section */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Tüm Rozetler ({badges.length}/{AVAILABLE_BADGES.length})</Text>
          <View style={styles.badgesGrid}>
            {AVAILABLE_BADGES.map((badge, index) => {
              const isUnlocked = badges.some(b => b.id === badge.id);
              const isNew = recentBadges.includes(badge.id);
              return (
                <AnimatedBadgeCard
                  key={badge.id}
                  badge={badge}
                  index={index}
                  isUnlocked={isUnlocked}
                  isNew={isNew}
                  onPress={() => setSelectedBadge(badge)}
                />
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* Success Summary Modal (Overlay) */}
      {summaryData && (
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.summaryContent, { opacity: summaryOpacityAnim, transform: [{ translateY: summaryTranslateYAnim }] }]}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconBox}>
                <Ionicons name="trophy" size={48} color="#F59E0B" />
              </View>
              <Text style={styles.summaryTitle}>Proje Tamamlandı!</Text>
              <Text style={styles.summaryProjectName}>{summaryData.projectName}</Text>
            </View>

            <View style={styles.summaryDetails}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Temel Ödül</Text>
                <Text style={styles.summaryValue}>+{summaryData.earnedXp} XP</Text>
              </View>
              {summaryData.bonusXp > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Uzmanlık Bonusu</Text>
                  <Text style={[styles.summaryValue, { color: "#10B981" }]}>+{summaryData.bonusXp} XP</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryTotalLabel}>Toplam Kazanılan</Text>
                <Text style={styles.summaryTotalValue}>+{summaryData.earnedXp + summaryData.bonusXp} XP</Text>
              </View>
            </View>

            {summaryData.unlockedBadges.length > 0 && (
              <View style={styles.summaryBadgesBox}>
                <Text style={styles.summaryBadgesTitle}>Yeni Açılan Rozetler!</Text>
                <View style={styles.summaryBadgesList}>
                  {summaryData.unlockedBadges.map(b => (
                    <View key={b.id} style={styles.summaryMiniBadge}>
                      <Ionicons name={b.icon} size={28} color={b.color} />
                      <Text style={styles.summaryMiniBadgeText}>{b.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Pressable
              style={[styles.actionButton, { backgroundColor: "#10B981", width: "100%", marginTop: 24 }]}
              onPress={() => setSummaryData(null)}
            >
              <Text style={styles.actionButtonText}>Devam Et</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </Pressable>
          </Animated.View>
        </View>
      )}

      {/* Badge Details Modal (Overlay) */}
      {selectedBadge && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable style={styles.modalCloseButton} onPress={() => setSelectedBadge(null)}>
              <Ionicons name="close" size={24} color="#64748B" />
            </Pressable>

            <View style={[styles.modalIconContainer, { backgroundColor: `${selectedBadge.color}15` }]}>
              <Ionicons name={selectedBadge.icon} size={48} color={selectedBadge.color} />
            </View>

            <Text style={styles.modalBadgeName}>{selectedBadge.name}</Text>

            <View style={styles.modalDivider} />

            <Text style={styles.modalBadgeDescTitle}>Kazanma Şartı</Text>
            <Text style={styles.modalBadgeDesc}>{selectedBadge.description}</Text>

          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F5F9", // Soft slate background
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 20,
  },
  workspaceCard: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  specialty: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  xpSection: {
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  levelBadgeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  xpText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  xpHint: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "right",
    fontWeight: "500",
  },
  // Typography
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
    marginTop: 4,
  },
  // Project Selection
  projectList: {
    marginBottom: 20,
    gap: 12, // React Native >= 0.71 supports gap
  },
  projectOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "transparent",
  },
  projectOptionSelected: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  projectIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  projectDetails: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  projectMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  projectDifficulty: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  projectMetaDot: {
    fontSize: 12,
    color: "#CBD5E1",
  },
  projectXpLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  bonusBadge: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: "800",
    color: "#10B981",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  // Active Project
  activeProjectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  activeProjectLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  activeProjectTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  activeProjectReward: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  taskProgressSection: {
    marginBottom: 28,
  },
  taskProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  taskProgressLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },
  taskProgressPercent: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
  },
  taskProgressBarContainer: {
    height: 16,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    overflow: "hidden",
  },
  taskProgressBarFill: {
    height: "100%",
    borderRadius: 8,
  },
  workflowActions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  // Shared Buttons
  actionButton: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  // Badges
  badgesSection: {
    width: "100%",
    maxWidth: 450,
    paddingBottom: 40,
    paddingHorizontal: 4,
  },
  emptyBadgeContainer: {
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "500",
    lineHeight: 20,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12, // Support for gap in flexbox natively in RN => 0.71
    paddingVertical: 12,
  },
  badgeCard: {
    alignItems: "center",
    justifyContent: "center",
    width: 110,
    height: 120,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderRadius: 20,
    marginRight: 16,
    padding: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  badgeText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    color: "#1E293B",
  },
  // Modal Styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  modalBadgeName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  modalDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 20,
  },
  modalBadgeDescTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  modalBadgeDesc: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
    textAlign: "left",
    alignSelf: "flex-start",
  },
  // Summary Modal Styles
  summaryContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  summaryHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  summaryIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF3C7", // amber-100
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 4,
  },
  summaryProjectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
  },
  summaryDetails: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  summaryTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#10B981", // Emerald
  },
  summaryBadgesBox: {
    width: "100%",
    alignItems: "center",
  },
  summaryBadgesTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 12,
  },
  summaryBadgesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  summaryMiniBadge: {
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 16,
    width: 80,
  },
  summaryMiniBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 6,
    textAlign: "center",
  },
});
