# Use the official Gradle image to build the app

FROM openjdk:17-oracle AS builder
WORKDIR /home/gradle/project

# Copy the project files
COPY . .
#
## Build the project and generate the JAR file
#RUN gradle build --no-daemon

# Use a smaller base image to run the JAR file
FROM openjdk:17-oracle
WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=builder /home/gradle/project/rest/build/libs/*.jar app.jar

# Expose the port the app runs on
EXPOSE 8080

# Run the JAR file
ENTRYPOINT ["java", "-jar", "app.jar"]