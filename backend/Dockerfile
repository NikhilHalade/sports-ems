# Step 1: Build the Maven application using Maven directly
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
# Make mvnw executable if present, then build using maven
RUN chmod +x ./mvnw || true
RUN mvn clean package -DskipTests

# Step 2: Run the compiled JAR
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]