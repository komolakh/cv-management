import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const resources = {
	en: {
		translation: {
			header: {
				logo: 'CV Manager',
				home: 'Home',
				positions: 'Positions',
				profile: 'Profile',
				attributeLibrary: 'Attribute Library',
				admin: 'Admin Panel',
				signIn: 'Sign In',
				signUp: 'Sign Up'
			},
			home: {
				statsTitle: 'Platform Statistics',
				totalPositions: 'Total positions',
				candidates: 'Candidates',
				recruiters: 'Recruiters',
				totalSubmittedCvs: 'Submitted CVs',
				newCvs24h: 'New CVs',
				latestPositions: 'Latest Open Positions',
				searchPlaceholder: 'Search by title...',
				tableColTitle: 'Position Title',
				tableColDesc: 'Description',
				popularPositionsTitle: 'Top 5 positions',
				tableColPopularNum: 'No.',
				tableColPopularTitle: 'Position',
				tableColPopularCount: 'Submitted CVs',
				techCloudTitle: 'Technology Cloud'
			},
			admin: {
				title: 'Admin Panel',
				tableEmail: 'Email',
				tableName: 'Name',
				tableRole: 'Current Role',
				tableAction: 'Action'
			},
			attributeLibrary: {
				title: 'Attribute Library',
				btnAdd: 'Add Attribute',
				searchPlaceholder: 'Search by name...',
				filterAllTypes: 'All Types',
				tableCategory: 'Category',
				tableName: 'Name',
				tableType: 'Data Type',
				dialogCreateTitle: 'New Library Attribute',
				dialogEditTitle: 'Edit Attribute',
				labelCategory: 'Category',
				labelName: 'Name',
				labelType: 'Type',
				btnCancel: 'Cancel',
				btnSave: 'Save',
				btnEditSelected: 'Edit',
				btnDeleteSelected: 'Delete'
			},
			cvConstructor: {
				recruitmentStatus: 'Recruitment Status',
				characteristicsTitle: 'Qualification Characteristics',
				parameter: 'Parameter',
				enterValuePlaceholder: 'Enter value...',
				notFilledWarning: 'Value not filled!',
				projectsTitle: 'Relevant Experience & Projects',
				templateLimit: 'Template limit: {{count}} of {{max}}'
			},
			positionsPage: {
				title: 'Positions Management',
				btnCreate: 'Create Position',
				searchPlaceholder: 'Search positions...',
				tableColTitle: 'Title',
				tableColDesc: 'Description',
				tableColTags: 'Tags',
				tableColAttrs: 'Attributes',
				selector: {
					title: 'Attributes',
					selectedCount_other: 'Selected: {{count}}',
					searchPlaceholder: 'Search attributes...'
				},
				dialog: {
					editTitle: 'Edit Position',
					createTitle: 'New Position',
					fieldName: 'Title',
					fieldNamePlaceholder: 'e.g. Frontend Developer',
					fieldDesc: 'Description',
					fieldDescPlaceholder: 'Brief description of the position...',
					fieldMaxProjects: 'Max Projects',
					fieldTags: 'Project Tags',
					fieldTagsPlaceholder: 'react, typescript, node',
					btnCancel: 'Cancel',
					btnSubmit: 'Create'
				},
				toolbar: {
					btnEdit: 'Edit',
					btnDuplicate: 'Duplicate',
					btnDelete: 'Delete'
				}
			},
			profile: {
				noLocation: 'Location not specified',
				meSection: 'Me',
				infoSection: 'Info',
				firstNameLabel: 'First Name',
				lastNameLabel: 'Last Name',
				locationLabel: 'Location',
				selectAttributePlaceholder: 'Select attribute',
				projectsSection: 'Projects',
				btnAdd: 'Add',
				presentDate: 'Present',
				cvsSection: 'CVs',
				dialog: {
					editTitle: 'Edit Project',
					createTitle: 'New Project',
					projectName: 'Name',
					projectDesc: 'Description',
					projectTags: 'Tags',
					btnCancel: 'Cancel',
					btnSave: 'Save'
				}
			}
		}
	},
	ru: {
		translation: {
			header: {
				logo: 'CV Manager',
				home: 'Главная',
				positions: 'Позиции',
				profile: 'Профиль',
				attributeLibrary: 'Библиотека атрибутов',
				admin: 'Админ-панель',
				signIn: 'Войти',
				signUp: 'Регистрация'
			},
			home: {
				statsTitle: 'Статистика платформы',
				totalPositions: 'Всего позиций',
				candidates: 'Кандидатов',
				recruiters: 'Рекрутеров',
				totalSubmittedCvs: 'Отправлено CV',
				newCvs24h: 'Новых CV',
				latestPositions: 'Последние открытые позиции',
				searchPlaceholder: 'Поиск по названию...',
				tableColTitle: 'Название позиции',
				tableColDesc: 'Описание',
				popularPositionsTitle: 'Топ-5 позиций',
				tableColPopularNum: 'No.',
				tableColPopularTitle: 'Позиция',
				tableColPopularCount: 'Подано резюме (CV)',
				techCloudTitle: 'Облако технологий'
			},
			admin: {
				title: 'Админ Панель',
				tableEmail: 'Email',
				tableName: 'Имя',
				tableRole: 'Текущая роль',
				tableAction: 'Действие'
			},
			attributeLibrary: {
				title: 'Библиотека атрибутов',
				btnAdd: 'Добавить атрибут',
				searchPlaceholder: 'Поиск по названию...',
				filterAllTypes: 'Все типы',
				tableCategory: 'Категория',
				tableName: 'Название',
				tableType: 'Тип данных',
				dialogCreateTitle: 'Новый атрибут библиотеки',
				dialogEditTitle: 'Редактирование атрибута',
				labelCategory: 'Категория',
				labelName: 'Название',
				labelType: 'Тип',
				btnCancel: 'Отмена',
				btnSave: 'Сохранить',
				btnEditSelected: 'Изменить',
				btnDeleteSelected: 'Удалить'
			},
			cvConstructor: {
				recruitmentStatus: 'Статус подбора',
				characteristicsTitle: 'Квалификационные характеристики',
				enterValuePlaceholder: 'Введите значение...',
				notFilledWarning: 'Значение не заполнено!',
				projectsTitle: 'Релевантный опыт и проекты',
				templateLimit: 'Лимит шаблона: {{count}} из {{max}}'
			},
			positionsPage: {
				title: 'Управление позициями',
				btnCreate: 'Создать позицию',
				searchPlaceholder: 'Поиск позиций...',
				tableColTitle: 'Название',
				tableColDesc: 'Описание',
				tableColTags: 'Теги',
				tableColAttrs: 'Атрибуты',
				selector: {
					title: 'Атрибуты',
					selectedCount_other: 'Выбрано: {{count}}',
					searchPlaceholder: 'Поиск атрибутов...'
				},
				dialog: {
					editTitle: 'Изменить позицию',
					createTitle: 'Новая позиция',
					fieldName: 'Название',
					fieldNamePlaceholder: 'Например: Frontend Developer',
					fieldDesc: 'Описание',
					fieldDescPlaceholder: 'Краткое описание позиции...',
					fieldMaxProjects: 'Макс. проектов',
					fieldTags: 'Теги проектов',
					fieldTagsPlaceholder: 'react, typescript, node',
					btnCancel: 'Отмена',
					btnSubmit: 'Создать'
				},
				toolbar: {
					btnEdit: 'Изменить',
					btnDuplicate: 'Дублировать',
					btnDelete: 'Удалить'
				}
			},
			profile: {
				noLocation: 'Город не указан',
				meSection: 'Я',
				infoSection: 'Информация',
				firstNameLabel: 'Имя',
				lastNameLabel: 'Фамилия',
				locationLabel: 'Локация',
				selectAttributePlaceholder: 'Выберите атрибут',
				projectsSection: 'Проекты',
				btnAdd: 'Добавить',
				presentDate: 'По настоящее время',
				cvsSection: 'Резюме',
				dialog: {
					editTitle: 'Редактировать проект',
					createTitle: 'Новый проект',
					projectName: 'Название',
					projectDesc: 'Описание',
					projectTags: 'Теги',
					btnCancel: 'Отмена',
					btnSave: 'Сохранить'
				}
			}
		}
	}
}

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false
		}
	})

export default i18n
