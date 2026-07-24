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
				adminMobile: 'Admin',
				signIn: 'Sign In',
				signUp: 'Sign Up'
			},
			sync: {
				init: 'Initializing synchronization for user: ',
				warnToken: 'Clerk token is not ready yet, retrying...',
				success: 'User successfully synchronized with PostgreSQL via Prisma!',
				error: 'Critical error during sync request:'
			},
			home: {
				loading: 'Loading platform data...',
				statsTitle: 'CV Management Platform Statistics',
				totalPositions: 'Total positions',
				candidates: 'Candidates',
				recruiters: 'Recruiters',
				totalSubmittedCvs: 'Submitted CVs (total)',
				newCvs24h: 'New CVs (24h)',
				latestPositions: 'Latest Open Positions',
				searchPlaceholder: 'Search by title...',
				noPositionsFound: 'No positions found.',
				tableCaption: 'Recently created or updated job openings.',
				tableColTitle: 'Position Title',
				tableColDesc: 'Description',
				tableColAction: 'Action',
				btnBuildCv: 'Build CV',
				popularPositionsTitle: 'Popular Positions (Top 5)',
				tableColPopularNum: '#',
				tableColPopularTitle: 'Position',
				tableColPopularCount: 'Submitted CVs',
				techCloudTitle: 'Technology Cloud',
				techCloudDesc:
					'Select a skill to quickly search for matching CVs (for Recruiters) or positions (for Candidates).',
				noTagsFound: 'No tags found'
			},
			admin: {
				loading: 'Loading admin panel...',
				fetchError: 'Access denied or server error',
				title: 'Admin Panel: Role Management',
				subtitle: 'Manage user access rights and system permissions',
				noUsers: 'No users found',
				noName: 'No name',
				tableEmail: 'Email',
				tableName: 'Name',
				tableRole: 'Current Role',
				tableAction: 'Action',
				successUpdate: 'Role updated successfully!',
				errorUpdate: 'Failed to update role',
				roles: {
					CANDIDATE: 'Candidate',
					RECRUITER: 'Recruiter',
					ADMINISTRATOR: 'Administrator'
				}
			},
			attributeLibrary: {
				title: 'Attribute Library',
				loading: 'Loading attribute library...',
				errorTitle: 'System Alert',
				fetchError: 'Failed to load attribute library from server.',
				saveError: 'Failed to save attribute. Key must be unique.',
				deleteError: 'Failed to delete attribute.',
				confirmDelete: 'Are you sure you want to delete this attribute?',
				btnAdd: 'Add Attribute',
				searchPlaceholder: 'Search by name...',
				filterAllTypes: 'All Types',
				noData: 'No library attributes found matching your criteria.',
				tableName: 'Name',
				tableKey: 'Unique Key',
				tableType: 'Data Type',
				tableDescription: 'Description',
				tableActions: 'Actions',
				dialogCreateTitle: 'New Library Attribute',
				dialogEditTitle: 'Edit Attribute',
				labelName: 'Attribute Name',
				labelType: 'Type',
				btnCancel: 'Cancel',
				btnSave: 'Save',
				selectedCount: 'Selected',
				btnEditSelected: 'Edit',
				btnDeleteSelected: 'Delete'
			},
			cvConstructor: {
				loading: 'Assembling a professional resume...',
				errorTitle: 'Loading Error',
				errorDesc:
					'Failed to find the position or generate a resume for the specified template ID.',
				backToMain: 'Back to Home',
				backToPositions: 'To position list',
				readOnlyMode: 'View Mode (Read-Only)',
				candidateResume: 'Candidate Resume',
				desiredPosition: 'Desired Position',
				email: 'Email',
				recruitmentStatus: 'Recruitment Status',
				characteristicsTitle: '1. Qualification Characteristics',
				parameter: 'Parameter',
				enterValuePlaceholder: 'Enter value...',
				notFilledWarning: 'Value not filled!',
				projectsTitle: '2. Relevant Experience & Projects',
				templateLimit: 'Template limit: {{count}} of {{max}}',
				noProjects: 'No projects match the technology tags for this position:',
				noTags: 'tags not specified'
			},
			positionsPage: {
				title: 'Position Templates',
				btnCreate: 'Create Position',
				searchPlaceholder: 'Search by template title...',
				loading: 'Loading positions...',
				noPositionsFound:
					'No positions found. Adjust your search or add a new template.',
				deleteConfirm: 'Are you sure you want to delete this position?',
				maxProjectsLabel: 'Max projects in CV: {{count}}',
				projectTagsLabel: 'Project matching tags:',
				requiredAttributesLabel: 'Required attributes ({{count}}):',
				btnDiscussion: 'Discussion',
				dialog: {
					title: 'New Position Template',
					description:
						'Create a job template, select the required knowledge attributes, and define project selection criteria.',
					fieldName: 'Position Title',
					fieldNamePlaceholder: 'e.g. Senior Frontend Engineer (React)',
					fieldDesc: 'Short Description',
					fieldDescPlaceholder:
						'Describe the technology stack or key business requirements...',
					fieldMaxProjects: 'Max projects in CV',
					fieldTags: 'Project tags (comma separated)',
					fieldTagsPlaceholder: 'react, typescript, web3',
					btnCancel: 'Cancel',
					btnSubmit: 'Create'
				},
				selector: {
					title: 'Required job attributes',
					selectedCount: 'Selected: {{count}}',
					searchPlaceholder: 'Search attributes (Hard skills, experience...)',
					loading: 'Loading library...',
					empty: 'No attributes found'
				}
			},
			profile: {
				title: 'Candidate Profile',
				subtitle:
					'Manage your qualifications, tech stack attributes, and personal details.',
				loading: 'Loading profile data...',
				notFound: 'User profile not found.',
				saving: 'Saving changes...',
				personalInfo: 'Personal Information',
				email: 'Email Address',
				firstName: 'First Name',
				lastName: 'Last Name',
				roleLabel: 'Account Role',
				attributesTitle: 'Qualification Attributes & Hard Skills',
				attributesDesc:
					'These attributes are matched against job requirements when generating your CV.',
				emptyAttributes:
					'No qualification attributes available. Contact an administrator to assign attributes to your profile template.',
				inputPlaceholder: 'Enter your value...',
				saveSuccess: 'Profile attribute updated successfully!',
				saveError: 'Failed to update attribute',
				versionConflict:
					'Version conflict! This data was modified in another tab or by another process. Please refresh the page.',
				lastUpdated: 'Last updated: {{date}}',
				versionLabel: 'v{{version}}',
				defaultFirstName: 'Name',
				defaultLastName: 'Surname',
				noLocation: 'Location not specified',
				meSection: 'Me',
				infoSection: 'Info',
				firstNameLabel: 'First Name',
				lastNameLabel: 'Last Name',
				locationLabel: 'Location (e.g. City, Country)',
				selectAttributePlaceholder: 'Select attribute to add...',
				projectsSection: 'Projects',
				btnAddProject: 'Add Project',
				noProjects: 'No projects added yet.',
				presentDate: 'Present',
				cvsSection: 'CVs',
				noCvs: 'No CVs generated yet.',
				untitledPosition: 'Untitled Position',
				btnOpenCv: 'Open CV',
				dialog: {
					editTitle: 'Edit Project',
					createTitle: 'New Project',
					projectName: 'Project Name',
					btnCancel: 'Cancel',
					btnSave: 'Save'
				}
			},
			actions: {
				buildCvAlert: 'Navigating to CV builder for position: {{title}}',
				techFilterAlert: 'Filtering by technology: {{tech}}',
				errorLabel: 'Error: {{message}}'
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
				adminMobile: 'Админ',
				signIn: 'Войти',
				signUp: 'Регистрация'
			},
			sync: {
				init: 'Инициализация синхронизации для пользователя: ',
				warnToken: 'Токен Clerk еще не готов, повторная попытка...',
				success:
					'Пользователь успешно синхронизирован с PostgreSQL via Prisma!',
				error: 'Критическая ошибка при отправке запроса sync:'
			},
			home: {
				loading: 'Загрузка данных платформы...',
				statsTitle: 'Статистика платформы CV Management',
				totalPositions: 'Всего позиций',
				candidates: 'Кандидатов',
				recruiters: 'Рекрутеров',
				totalSubmittedCvs: 'Отправлено CV (всего)',
				newCvs24h: 'Новых CV (24ч)',
				latestPositions: 'Последние открытые позиции',
				searchPlaceholder: 'Поиск по названию...',
				noPositionsFound: 'Позиций не найдено.',
				tableCaption: 'Недавно созданные или обновленные вакансии.',
				tableColTitle: 'Название позиции',
				tableColDesc: 'Описание',
				tableColAction: 'Действие',
				btnBuildCv: 'Собрать CV',
				popularPositionsTitle: 'Популярные позиции (Топ-5)',
				tableColPopularNum: '#',
				tableColPopularTitle: 'Позиция',
				tableColPopularCount: 'Подано резюме (CV)',
				techCloudTitle: 'Облако технологий',
				techCloudDesc:
					'Выберите навык для быстрого поиска подходящих CV (для Рекрутеров) или позиций (для Кандидатов).',
				noTagsFound: 'Теги не найдены'
			},
			admin: {
				loading: 'Загрузка панели администратора...',
				fetchError: 'Доступ запрещен или ошибка сервера',
				title: 'Панель администратора: Управление ролями',
				subtitle: 'Управление пользователями и правами доступа',
				noUsers: 'Пользователи не найдены',
				noName: 'Без имени',
				tableEmail: 'Email',
				tableName: 'Имя',
				tableRole: 'Текущая роль',
				tableAction: 'Действие',
				successUpdate: 'Роль успешно обновлена!',
				errorUpdate: 'Не удалось изменить роль',
				roles: {
					CANDIDATE: 'Кандидат',
					RECRUITER: 'Рекрутер',
					ADMINISTRATOR: 'Администратор'
				}
			},
			attributeLibrary: {
				title: 'Библиотека атрибутов',
				loading: 'Загрузка библиотеки атрибутов...',
				errorTitle: 'Системное уведомление',
				fetchError: 'Не удалось загрузить библиотеку атрибутов с сервера.',
				saveError: 'Ошибка сохранения. Системный ключ должен быть уникальным.',
				deleteError: 'Не удалось удалить атрибут.',
				confirmDelete: 'Вы уверены, что хотите удалить этот атрибут?',
				btnAdd: 'Добавить атрибут',
				searchPlaceholder: 'Поиск по названию...',
				filterAllTypes: 'Все типы',
				noData: 'Атрибуты библиотеки не найдены.',
				tableName: 'Название',
				tableKey: 'Системный ключ',
				tableType: 'Тип данных',
				tableDescription: 'Описание',
				tableActions: 'Действия',
				dialogCreateTitle: 'Новый атрибут библиотеки',
				dialogEditTitle: 'Редактирование атрибута',
				labelName: 'Название атрибута',
				labelType: 'Тип',
				btnCancel: 'Отмена',
				btnSave: 'Сохранить',
				selectedCount: 'Выбрано',
				btnEditSelected: 'Изменить',
				btnDeleteSelected: 'Удалить'
			},
			cvConstructor: {
				loading: 'Сборка профессионального резюме...',
				errorTitle: 'Ошибка загрузки',
				errorDesc:
					'Не удалось найти позицию или сгенерировать резюме для указанного ID шаблона.',
				backToMain: 'Вернуться на главную',
				backToPositions: 'К списку позиций',
				readOnlyMode: 'Режим просмотра (Только чтение)',
				candidateResume: 'Резюме соискателя',
				desiredPosition: 'Желаемая позиция',
				email: 'Email',
				recruitmentStatus: 'Статус подбора',
				characteristicsTitle: '1. Квалификационные характеристики',
				parameter: 'Параметр',
				enterValuePlaceholder: 'Введите значение...',
				notFilledWarning: 'Значение не заполнено!',
				projectsTitle: '2. Релевантный опыт и проекты',
				templateLimit: 'Лимит шаблона: {{count}} из {{max}}',
				noProjects:
					'Нет проектов, удовлетворяющих технологическим тегам позиции:',
				noTags: 'теги не установлены'
			},
			positionsPage: {
				title: 'Шаблоны позиций',
				btnCreate: 'Создать позицию',
				searchPlaceholder: 'Поиск по названию шаблона...',
				loading: 'Загрузка шаблонов...',
				noPositionsFound:
					'Позиций не найдено. Измените параметры поиска или добавьте новый шаблон.',
				deleteConfirm: 'Вы уверены, что хотите удалить эту позицию?',
				maxProjectsLabel: 'Максимум проектов в CV: {{count}}',
				projectTagsLabel: 'Теги подбора проектов:',
				requiredAttributesLabel: 'Обязательные атрибуты ({{count}}):',
				btnDiscussion: 'Обсуждение',
				dialog: {
					title: 'Новый шаблон позиции',
					description:
						'Создайте шаблон вакансии, выберите требуемые атрибуты знаний и задайте критерии отбора проектов.',
					fieldName: 'Название позиции',
					fieldNamePlaceholder: 'Например: Senior Frontend Engineer (React)',
					fieldDesc: 'Краткое описание',
					fieldDescPlaceholder:
						'Опишите стек технологий или ключевые бизнес-требования...',
					fieldMaxProjects: 'Макс. проектов в CV',
					fieldTags: 'Теги проектов (через запятую)',
					fieldTagsPlaceholder: 'react, typescript, web3',
					btnCancel: 'Отмена',
					btnSubmit: 'Создать'
				},
				selector: {
					title: 'Требуемые атрибуты вакансии',
					selectedCount: 'Выбрано: {{count}}',
					searchPlaceholder: 'Поиск атрибутов (Hard-skills, опыт...)',
					loading: 'Загрузка библиотеки...',
					empty: 'Атрибуты не найдены'
				}
			},
			profile: {
				title: 'Профиль кандидата',
				subtitle:
					'Управляйте своими квалификационными характеристиками, технологическим стеком и личными данными.',
				loading: 'Загрузка данных профиля...',
				notFound: 'Профиль пользователя не найден.',
				saving: 'Сохранение изменений...',
				personalInfo: 'Личная информация',
				email: 'Электронная почта',
				firstName: 'Имя',
				lastName: 'Фамилия',
				roleLabel: 'Роль аккаунта',
				attributesTitle: 'Квалификационные атрибуты и навыки',
				attributesDesc:
					'Эти значения сопоставляются с требованиями вакансий при автоматической генерации вашего CV.',
				emptyAttributes:
					'Квалификационные атрибуты отсутствуют. Обратитесь к администратору для привязки атрибутов к вашему шаблону профиля.',
				inputPlaceholder: 'Введите значение...',
				saveSuccess: 'Атрибут профиля успешно обновлен!',
				saveError: 'Не удалось обновить атрибут',
				versionConflict:
					'Конфликт версий! Данные профиля были изменены в другой вкладке или другим процессом. Пожалуйста, обновите страницу.',
				lastUpdated: 'Последнее обновление: {{date}}',
				versionLabel: 'v{{version}}',
				defaultFirstName: 'Имя',
				defaultLastName: 'Фамилия',
				noLocation: 'Город не указан',
				meSection: 'Я',
				infoSection: 'Информация',
				firstNameLabel: 'Имя',
				lastNameLabel: 'Фамилия',
				locationLabel: 'Локация (например, Город, Страна)',
				selectAttributePlaceholder: 'Выберите атрибут для добавления...',
				projectsSection: 'Проекты',
				btnAdd: 'Добавить',
				noProjects: 'Проекты пока не добавлены.',
				presentDate: 'По настоящее время',
				cvsSection: 'Резюме (CV)',
				noCvs: 'Резюме еще не создавались.',
				untitledPosition: 'Позиция без названия',
				btnOpenCv: 'Открыть CV',
				dialog: {
					editTitle: 'Редактировать проект',
					createTitle: 'Новый проект',
					projectName: 'Название проекта',
					btnCancel: 'Отмена',
					btnSave: 'Сохранить'
				}
			},
			actions: {
				buildCvAlert: 'Переход к сборке CV под позицию: {{title}}',
				techFilterAlert: 'Фильтр по технологии: {{tech}}',
				errorLabel: 'Ошибка: {{message}}'
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
