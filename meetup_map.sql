-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: meetup
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `place`
--
CREATE DATABASE meetup_map;

USE meetup_map;

DROP TABLE IF EXISTS `place`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `place` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `rating` float DEFAULT '0',
  `popularity` int DEFAULT '0',
  `search_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `place`
--

LOCK TABLES `place` WRITE;
/*!40000 ALTER TABLE `place` DISABLE KEYS */;
INSERT INTO `place` VALUES (1,'스타벅스 시청점','cafe',37.5663,126.9779,4.5,500,300,'2025-11-30 09:17:09'),(2,'메가커피 광화문점','cafe',37.5711,126.9769,4.3,350,250,'2025-11-30 09:17:09'),(3,'투썸플레이스 종로점','cafe',37.5695,126.9865,4.4,420,290,'2025-11-30 09:17:09'),(4,'김밥천국 시청점','food',37.5675,126.978,4.1,300,210,'2025-11-30 09:17:09'),(5,'한솥도시락 광화문점','food',37.5719,126.9762,4.2,280,200,'2025-11-30 09:17:09'),(6,'이디야커피 세종문화회관점','cafe',37.5728,126.9767,4,260,180,'2025-11-30 09:17:09'),(7,'스터디카페 광화문점','study',37.5708,126.983,4.6,410,220,'2025-11-30 09:17:09'),(8,'작심스터디 종로본점','study',37.5692,126.986,4.7,430,240,'2025-11-30 09:17:09'),(9,'연세스터디룸 종각점','study',37.57,126.982,4.5,380,200,'2025-11-30 09:17:09'),(10,'브런치카페 리치','cafe',37.565,126.9825,4.8,450,320,'2025-11-30 09:17:09');
/*!40000 ALTER TABLE `place` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `places`
--

DROP TABLE IF EXISTS `places`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `places` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `kakao_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `search_count` int DEFAULT '0',
  `popularity` int DEFAULT '0',
  `last_update` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kakao_id` (`kakao_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `places`
--

LOCK TABLES `places` WRITE;
/*!40000 ALTER TABLE `places` DISABLE KEYS */;
/*!40000 ALTER TABLE `places` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_users`
--

DROP TABLE IF EXISTS `room_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_code` varchar(5) NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `room_code` (`room_code`),
  CONSTRAINT `room_users_ibfk_1` FOREIGN KEY (`room_code`) REFERENCES `rooms` (`code`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_users`
--

LOCK TABLES `room_users` WRITE;
/*!40000 ALTER TABLE `room_users` DISABLE KEYS */;
INSERT INTO `room_users` VALUES (1,'FHAI7','신선호','2025-11-30 09:19:57'),(2,'FHAI7','test','2025-11-30 09:20:41'),(3,'FHAI7','test','2025-11-30 09:20:59'),(4,'YPUQA','신선호','2025-11-30 09:25:37'),(5,'2NEYJ','신선호','2025-11-30 09:27:55'),(6,'2NEYJ','test','2025-11-30 09:28:13'),(7,'2NEYJ','신선호','2025-11-30 09:29:15'),(8,'2NEYJ','신선호','2025-11-30 09:30:59'),(9,'2NEYJ','신선호','2025-11-30 09:31:11'),(10,'2NEYJ','test','2025-11-30 09:32:44'),(11,'Q8I1F','신선호','2025-11-30 09:40:10'),(12,'Q8I1F','신선호','2025-11-30 09:40:26'),(13,'Q8I1F','test','2025-11-30 09:40:37'),(14,'1972H','test1','2025-11-30 09:40:54'),(15,'1972H','test2','2025-11-30 09:41:05'),(16,'1972H','test2','2025-12-02 08:16:02'),(17,'1972H','test2','2025-12-02 08:18:03'),(18,'2NEYJ','test2','2025-12-02 08:21:03'),(19,'1972H','신선호','2025-12-02 08:21:17'),(20,'2NEYJ','신선호','2025-12-02 08:21:32'),(21,'1972H','test2','2025-12-02 08:23:52'),(22,'2NEYJ','test2','2025-12-02 08:29:47'),(23,'2NEYJ','신선호','2025-12-02 08:30:39'),(24,'2NEYJ','신선호','2025-12-02 08:38:43'),(25,'2NEYJ','신선호','2025-12-02 08:39:10'),(26,'2NEYJ','test2','2025-12-02 08:39:21'),(27,'2NEYJ','신선호','2025-12-02 08:40:30'),(28,'2NEYJ','신선호','2025-12-02 08:51:43'),(29,'2NEYJ','test2','2025-12-02 08:52:09'),(30,'2NEYJ','test2','2025-12-02 08:56:50'),(31,'2NEYJ','신선호','2025-12-02 09:02:05'),(32,'2NEYJ','test2','2025-12-02 09:02:49'),(33,'2NEYJ','신선호','2025-12-02 09:03:23'),(34,'2NEYJ','test2','2025-12-02 09:06:41'),(35,'2NEYJ','신선호','2025-12-02 09:13:34'),(36,'2NEYJ','test2','2025-12-02 09:14:12'),(37,'2NEYJ','신선호','2025-12-02 09:14:46'),(38,'2NEYJ','신선호','2025-12-02 09:31:05'),(39,'2NEYJ','신선호','2025-12-02 09:57:52'),(40,'2NEYJ','test2','2025-12-02 09:58:05'),(41,'2NEYJ','test2','2025-12-02 10:15:56'),(42,'2NEYJ','신선호','2025-12-02 10:18:02'),(43,'SYGS7','신선호','2025-12-03 08:12:27'),(44,'SYGS7','test2','2025-12-03 08:13:02'),(45,'SYGS7','test2','2025-12-03 15:54:21'),(46,'SYGS7','test2','2025-12-04 11:44:57'),(47,'71AK1','신선호','2025-12-05 07:10:48'),(48,'71AK1','test2','2025-12-05 07:10:56'),(49,'71AK1','신선호','2025-12-06 05:47:58'),(50,'71AK1','신선호','2025-12-06 12:13:57'),(51,'5BCGQ','test1','2025-12-06 12:37:58'),(52,'5BCGQ','test2','2025-12-06 12:38:17'),(53,'3FGPT','test1','2025-12-06 12:40:50'),(54,'3FGPT','test2','2025-12-06 12:41:16'),(55,'65AKU','test1','2025-12-19 15:03:49'),(56,'65AKU','test2','2025-12-19 15:04:20'),(57,'XXSIO','test1','2025-12-19 15:16:58'),(58,'XXSIO','test2','2025-12-19 15:17:17');
/*!40000 ALTER TABLE `room_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(5) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'FHAI7','2025-11-30 09:19:57'),(2,'YPUQA','2025-11-30 09:25:37'),(3,'2NEYJ','2025-11-30 09:27:55'),(4,'Q8I1F','2025-11-30 09:40:10'),(5,'1972H','2025-11-30 09:40:54'),(6,'SYGS7','2025-12-03 08:12:27'),(7,'71AK1','2025-12-05 07:10:47'),(8,'5BCGQ','2025-12-06 12:37:58'),(9,'3FGPT','2025-12-06 12:40:50'),(10,'65AKU','2025-12-19 15:03:49'),(11,'XXSIO','2025-12-19 15:16:58');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_location`
--

DROP TABLE IF EXISTS `user_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_location` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(100) NOT NULL,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_location`
--

LOCK TABLES `user_location` WRITE;
/*!40000 ALTER TABLE `user_location` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_location` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-09 20:40:54
