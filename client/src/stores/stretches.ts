import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Stretch } from './types'

export const useStretchStore = defineStore('stretch', () => {
  const stretches = ref<Stretch[]>([
    {
      id: 1,
      name: 'Overhead Triceps Stretch',
      category: 'Upper Body',
      status: 'Static',
      targetMuscles: ['Triceps', 'Latissimus Dorsi'],
    },
    {
      id: 2,
      name: 'Cross-Body Arm Stretch',
      category: 'Upper Body',
      status: 'Static',
      targetMuscles: ['Posterior Deltoids', 'Triceps'],
    },
    {
      id: 3,
      name: 'Biceps Wall Stretch',
      category: 'Upper Body',
      status: 'Static',
      targetMuscles: ['Biceps', 'Forearms'],
    },
    {
      id: 4,
      name: 'Sleeper Stretch',
      category: 'Upper Body',
      status: 'Static',
      targetMuscles: ['Rear Deltoids', 'Rotator Cuff'],
    },
    {
      id: 5,
      name: 'Thread the Needle',
      category: 'Upper Body',
      status: 'Dynamic',
      targetMuscles: ['Shoulders', 'Upper Back'],
    },
    {
      id: 6,
      name: 'Shoulder Wall Slides',
      category: 'Upper Body',
      status: 'Dynamic',
      targetMuscles: ['Deltoids', 'Scapular Stabilizers'],
    },
    {
      id: 7,
      name: 'Doorway Chest Opener',
      category: 'Upper Body',
      status: 'Static',
      targetMuscles: ['Pectorals', 'Anterior Deltoids'],
    },
    {
      id: 8,
      name: 'Cobra Chest Lift',
      category: 'Upper Body',
      status: 'Static',
      targetMuscles: ['Pectorals', 'Abdominals'],
    },
    {
      id: 9,
      name: 'Cat-Cow Flow',
      category: 'Core',
      status: 'Dynamic',
      targetMuscles: ['Lower Back', 'Abdominals'],
    },
    {
      id: 10,
      name: 'Child\'s Pose Reach',
      category: 'Core',
      status: 'Static',
      targetMuscles: ['Latissimus Dorsi', 'Erector Spinae'],
    },
    {
      id: 11,
      name: 'Seated Spinal Twist',
      category: 'Core',
      status: 'Static',
      targetMuscles: ['Obliques', 'Thoracic Spine'],
    },
    {
      id: 12,
      name: 'Figure Four Stretch',
      category: 'Lower Body',
      status: 'Static',
      targetMuscles: ['Glutes', 'Piriformis'],
    },
    {
      id: 13,
      name: 'Kneeling Glute Stretch',
      category: 'Lower Body',
      status: 'Static',
      targetMuscles: ['Glutes', 'Hip Rotators'],
    },
    {
      id: 14,
      name: 'Standing Quad Stretch',
      category: 'Lower Body',
      status: 'Static',
      targetMuscles: ['Quadriceps', 'Hip Flexors'],
    },
    {
      id: 15,
      name: 'Side-Lying Quad Stretch',
      category: 'Lower Body',
      status: 'Static',
      targetMuscles: ['Quadriceps', 'Rectus Femoris'],
    },
    {
      id: 16,
      name: 'Seated Hamstring Reach',
      category: 'Lower Body',
      status: 'Static',
      targetMuscles: ['Hamstrings', 'Calves'],
    },
    {
      id: 17,
      name: 'Standing Hamstring Hinge',
      category: 'Lower Body',
      status: 'Dynamic',
      targetMuscles: ['Hamstrings', 'Glutes'],
    },
    {
      id: 18,
      name: 'Wall Calf Stretch',
      category: 'Lower Body',
      status: 'Static',
      targetMuscles: ['Calves', 'Achilles Tendon'],
    },
    {
      id: 19,
      name: 'World\'s Greatest Stretch',
      category: 'Full Body',
      status: 'Dynamic',
      targetMuscles: ['Hip Flexors', 'Glutes', 'Thoracic Spine'],
    },
    {
      id: 20,
      name: 'Inchworm Walkout',
      category: 'Full Body',
      status: 'Dynamic',
      targetMuscles: ['Hamstrings', 'Shoulders', 'Core'],
    },
    {
      id: 21,
      name: 'Downward Dog to Lunge Flow',
      category: 'Full Body',
      status: 'Dynamic',
      targetMuscles: ['Calves', 'Hamstrings', 'Shoulders', 'Hip Flexors'],
    },
  ])

  return { stretches }
})
